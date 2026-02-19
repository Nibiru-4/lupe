//
//  ChampionService.swift
//  lupe
//
//  Created by Yassin Meghazi on 18/02/2026.
//

import Foundation

final class ChampionService {
    private let baseURL = "https://ddragon.leagueoflegends.com/cdn/14.2.1/data/en_US/champion.json"
    
    func fetchChampions() async throws -> [Champion] {
        guard let url = URL(string: baseURL) else {
            throw URLError(.badURL)
        }
        
        let response : ChampionResponse = try await APIClient.shared.fetch(url: url)
        return Array(response.data.values).sorted { $0.name < $1.name }
    }
}
