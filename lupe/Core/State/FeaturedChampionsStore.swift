import Foundation

enum FeaturedChampionsStore {
    private static var featuredChampionIDs: [String] = []
    private static let featuredCount = 4
    
    static func featuredChampions(from champions: [Champion]) -> [Champion] {
        guard !champions.isEmpty else { return [] }
        
        if !featuredChampionIDs.isEmpty {
            let byId = Dictionary(uniqueKeysWithValues: champions.map { ($0.id, $0) })
            let resolved = featuredChampionIDs.compactMap { byId[$0] }
            if resolved.count == featuredChampionIDs.count {
                return resolved
            }
        }
        
        let selected = Array(champions.shuffled().prefix(min(featuredCount, champions.count)))
        featuredChampionIDs = selected.map(\.id)
        return selected
    }
}
