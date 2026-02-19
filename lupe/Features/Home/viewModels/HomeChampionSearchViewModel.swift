import Foundation
internal import Combine

@MainActor
final class HomeChampionSearchViewModel: ObservableObject {
    
    @Published private(set) var champions: [Champion] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let service: ChampionService
    
    init(service: ChampionService) {
        self.service = service
    }
    
    convenience init() {
        self.init(service: ChampionService())
    }
    
    func loadChampions() async {
        guard champions.isEmpty else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            champions = try await service.fetchChampions()
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func filteredChampions(matching query: String) -> [Champion] {
        let normalizedQuery = normalize(query)
        guard !normalizedQuery.isEmpty else { return [] }
        
        return champions.filter { champion in
            let name = normalize(champion.name)
            return name.contains(normalizedQuery)
        }
    }
    
    func exactMatch(for query: String) -> Champion? {
        let normalizedQuery = normalize(query)
        guard !normalizedQuery.isEmpty else { return nil }
        
        return champions.first { champion in
            normalize(champion.name) == normalizedQuery
        }
    }
    
    private func normalize(_ value: String) -> String {
        value
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .folding(options: [.diacriticInsensitive, .caseInsensitive], locale: .current)
            .lowercased()
    }
}
