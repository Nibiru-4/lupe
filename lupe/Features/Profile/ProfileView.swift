//
//  ProfileView.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//

import SwiftUI
internal import Combine

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @State private var gameName = ""
    @State private var tagLine = ""
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    VStack(spacing: 10) {
                        TextField("Game Name (ex: Faker)", text: $gameName)
                            .textFieldStyle(.roundedBorder)
                        TextField("Tag Line (ex: KR1)", text: $tagLine)
                            .textFieldStyle(.roundedBorder)
                        
                        Button {
                            Task {
                                await viewModel.search(gameName: gameName, tagLine: tagLine)
                            }
                        } label: {
                            Text("Search Match History")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(viewModel.isLoading || gameName.isEmpty || tagLine.isEmpty)
                    }
                    .padding()
                    .background(Color.black.opacity(0.25))
                    .cornerRadius(12)
                    
                    if viewModel.isLoading {
                        ProgressView()
                    }
                    
                    if let errorMessage = viewModel.errorMessage {
                        Text(errorMessage)
                            .foregroundColor(.red)
                    }
                    
                    if let player = viewModel.player {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("\(player.gameName)#\(player.tagLine)")
                                .font(.headline)
                            if let level = player.summonerLevel {
                                Text("Level \(level)")
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.black.opacity(0.25))
                        .cornerRadius(12)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Match history")
                            .font(.headline)
                        
                        if viewModel.matches.isEmpty {
                            Text("No matches yet.")
                                .foregroundColor(.secondary)
                        } else {
                            ForEach(viewModel.matches) { match in
                                HStack(spacing: 12) {
                                    Text(match.championName)
                                        .bold()
                                        .frame(width: 100, alignment: .leading)
                                    
                                    Text(match.kda)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                    
                                    Spacer()
                                    
                                    Text(match.win ? "Win" : "Loss")
                                        .foregroundColor(match.win ? .green : .red)
                                }
                                .padding(12)
                                .background(Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255))
                                .cornerRadius(10)
                            }
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("profile.title")
        }
    }
}

@MainActor
private final class ProfileViewModel: ObservableObject {
    @Published private(set) var player: PlayerProfile?
    @Published private(set) var matches: [PlayerMatchHistory] = []
    @Published private(set) var isLoading = false
    @Published private(set) var errorMessage: String?
    
    private let service = PlayerHistoryService()
    
    func search(gameName: String, tagLine: String) async {
        let trimmedGameName = gameName.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedTagLine = tagLine.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedGameName.isEmpty, !trimmedTagLine.isEmpty else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await service.searchAndSync(gameName: trimmedGameName, tagLine: trimmedTagLine)
            player = response.player
            matches = response.matches
        } catch {
            player = nil
            matches = []
            errorMessage = "Unable to fetch player history."
        }
        
        isLoading = false
    }
}
