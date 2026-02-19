//
//  ChampionViewModel.swift
//  lupe
//
//  Created by Yassin Meghazi on 18/02/2026.
//
import SwiftUI
internal import Combine

@MainActor
final class ChampionViewModel: ObservableObject {
    
    @Published var champions : [Champion] = []
    @Published var isLoading = false
    @Published var errorMessage : String?
    
    
    private let service = ChampionService()
    
    func loadChampions() async {
        isLoading = true
        errorMessage = nil
        
        do {
            champions = try await service.fetchChampions()
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading  = false
    }
}
