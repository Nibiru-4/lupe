import SwiftUI

struct ProfileView: View {
    @StateObject private var authStore = LupeAuthStore.shared
    @State private var isAuthSheetPresented = false
    
    var body: some View {
        NavigationStack {
            Group {
                if let account = authStore.currentAccount {
                    loggedInView(account: account)
                } else {
                    loggedOutView
                }
            }
            .padding()
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .background(Color("BackgroundColor").ignoresSafeArea())
            .navigationTitle("profile.title")
            .sheet(isPresented: $isAuthSheetPresented) {
                AuthSheetView(authStore: authStore)
            }
        }
    }
    
    private func loggedInView(account: LupeAccount) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("profile.connected")
                    .font(.headline)
                    .foregroundColor(.white)
                Text(account.email)
                    .foregroundColor(.white.opacity(0.85))
                Text("\(account.gameName)#\(account.tagLine)")
                    .foregroundColor(.white.opacity(0.85))
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255))
            .cornerRadius(12)
            
            NavigationLink {
                PlayerHistoryView(gameName: account.gameName, tagLine: account.tagLine)
            } label: {
                HStack {
                    Text("profile.open_saved_profile")
                    Spacer()
                    Image(systemName: "chevron.right")
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255))
                .cornerRadius(12)
            }
            .buttonStyle(.plain)
            
            Button {
                authStore.logout()
            } label: {
                Text("profile.logout")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            
            Spacer()
        }
    }
    
    private var loggedOutView: some View {
        VStack {
            Spacer()
            Button {
                isAuthSheetPresented = true
            } label: {
                Text("profile.login_cta")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .padding(.horizontal, 24)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct AuthSheetView: View {
    enum Mode: String, CaseIterable, Identifiable {
        case login
        case register
        var id: String { rawValue }
    }
    
    @ObservedObject var authStore: LupeAuthStore
    @Environment(\.dismiss) private var dismiss
    
    @State private var mode: Mode = .login
    @State private var email = ""
    @State private var password = ""
    @State private var gameName = ""
    @State private var tagLine = ""
    @State private var errorKey: String?
    
    var body: some View {
        NavigationStack {
            Form {
                Picker("auth.mode", selection: $mode) {
                    Text("auth.mode.login").tag(Mode.login)
                    Text("auth.mode.register").tag(Mode.register)
                }
                .pickerStyle(.segmented)
                
                TextField(String(localized: "auth.email"), text: $email)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                
                SecureField(String(localized: "auth.password"), text: $password)
                
                if mode == .register {
                    TextField(String(localized: "auth.gamename"), text: $gameName)
                    TextField(String(localized: "auth.tagline"), text: $tagLine)
                }
                
                if let errorKey {
                    Text(LocalizedStringKey(errorKey))
                        .foregroundColor(.red)
                }
                
                Button {
                    submit()
                } label: {
                    Text(mode == .login ? "auth.login" : "auth.create_account")
                        .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle("auth.title")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("auth.close") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func submit() {
        errorKey = nil
        do {
            switch mode {
            case .login:
                try authStore.login(email: email, password: password)
            case .register:
                try authStore.register(email: email, password: password, gameName: gameName, tagLine: tagLine)
            }
            dismiss()
        } catch let error as AuthError {
            errorKey = error.localizedDescription
        } catch {
            errorKey = "auth.error.unknown"
        }
    }
}
