import Foundation
import CryptoKit
internal import Combine

@MainActor
final class LupeAuthStore: ObservableObject {
    static let shared = LupeAuthStore()
    
    @Published private(set) var currentAccount: LupeAccount?
    
    private let accountsKey = "lupe.accounts"
    private let currentAccountEmailKey = "lupe.currentAccountEmail"
    private let defaults = UserDefaults.standard
    
    private init() {
        restoreSession()
    }
    
    func register(email: String, password: String, gameName: String, tagLine: String) throws {
        let normalizedEmail = normalize(email)
        guard !normalizedEmail.isEmpty, !password.isEmpty else {
            throw AuthError.missingFields
        }
        
        var accounts = loadAccounts()
        if accounts.contains(where: { normalize($0.email) == normalizedEmail }) {
            throw AuthError.emailAlreadyUsed
        }
        
        let account = LupeAccount(
            id: UUID(),
            email: normalizedEmail,
            passwordHash: hash(password),
            gameName: gameName.trimmingCharacters(in: .whitespacesAndNewlines),
            tagLine: tagLine.trimmingCharacters(in: .whitespacesAndNewlines),
            createdAt: Date()
        )
        
        accounts.append(account)
        saveAccounts(accounts)
        setCurrentAccount(account)
    }
    
    func login(email: String, password: String) throws {
        let normalizedEmail = normalize(email)
        let hashedPassword = hash(password)
        let accounts = loadAccounts()
        
        guard let account = accounts.first(where: {
            normalize($0.email) == normalizedEmail && $0.passwordHash == hashedPassword
        }) else {
            throw AuthError.invalidCredentials
        }
        
        setCurrentAccount(account)
    }
    
    func logout() {
        currentAccount = nil
        defaults.removeObject(forKey: currentAccountEmailKey)
    }
    
    private func restoreSession() {
        guard let email = defaults.string(forKey: currentAccountEmailKey) else { return }
        let normalizedEmail = normalize(email)
        currentAccount = loadAccounts().first(where: { normalize($0.email) == normalizedEmail })
    }
    
    private func setCurrentAccount(_ account: LupeAccount) {
        currentAccount = account
        defaults.set(account.email, forKey: currentAccountEmailKey)
    }
    
    private func loadAccounts() -> [LupeAccount] {
        guard let data = defaults.data(forKey: accountsKey) else { return [] }
        return (try? JSONDecoder().decode([LupeAccount].self, from: data)) ?? []
    }
    
    private func saveAccounts(_ accounts: [LupeAccount]) {
        let data = try? JSONEncoder().encode(accounts)
        defaults.set(data, forKey: accountsKey)
    }
    
    private func hash(_ value: String) -> String {
        let digest = SHA256.hash(data: Data(value.utf8))
        return digest.map { String(format: "%02x", $0) }.joined()
    }
    
    private func normalize(_ value: String) -> String {
        value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    }
}

enum AuthError: Error, LocalizedError {
    case missingFields
    case emailAlreadyUsed
    case invalidCredentials
    
    var errorDescription: String? {
        switch self {
        case .missingFields:
            return "auth.error.missing_fields"
        case .emailAlreadyUsed:
            return "auth.error.email_used"
        case .invalidCredentials:
            return "auth.error.invalid_credentials"
        }
    }
}
