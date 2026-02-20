//
//  HomeView.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//

import SwiftUI

fileprivate enum HomeRoute: Hashable {
    case detail(Champion)
    case notFound(String)
}

struct HomeView: View {

    @StateObject private var viewModel = HomeChampionSearchViewModel()
    @State private var searchText = ""
    @State private var path = NavigationPath()
    @State private var featuredChampions: [Champion] = []
    @State private var championStatsByName: [String: ChampionStats] = [:]
    
    private let championStatsService = ChampionStatsService()
    
    private var filteredChampions: [Champion] {
        viewModel.filteredChampions(matching: searchText)
    }
    
    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    FirstSection(text: $searchText, onSubmit: handleSearchSubmit)
                    
                    if let errorMessage = viewModel.errorMessage {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .padding(.horizontal, 8)
                    }
                    
                    if viewModel.isLoading && viewModel.champions.isEmpty {
                        HStack {
                            Spacer()
                            ProgressView()
                            Spacer()
                        }
                    } else if searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                        SecondSection(
                            champions: featuredChampions,
                            statsByChampionName: championStatsByName,
                            onChampionTap: { champion in
                                path.append(HomeRoute.detail(champion))
                            }
                        )
                    } else {
                        SearchResultsSection(champions: filteredChampions, path: $path)
                    }
                }
                .frame(maxWidth: .infinity,maxHeight: .infinity ,alignment: .topLeading)
                .navigationTitle("home.title")
                .contentShape(Rectangle())
                .onTapGesture {
                    UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                }
            }
            .navigationDestination(for: HomeRoute.self) { route in
                switch route {
                case .detail(let champion):
                    ChampionDetailView(champion: champion)
                case .notFound(let query):
                    ChampionNotFoundView(query: query)
                }
            }
            .task {
                await viewModel.loadChampions()
                await loadChampionStats()
                refreshFeaturedChampions()
            }
            .onChange(of: viewModel.champions) { _ in
                refreshFeaturedChampions()
            }
        }
    }
    
    private func handleSearchSubmit() {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else { return }
        
        if let champion = viewModel.exactMatch(for: query) {
            path.append(HomeRoute.detail(champion))
        } else {
            path.append(HomeRoute.notFound(query))
        }
    }
    
    private func refreshFeaturedChampions() {
        featuredChampions = Array(viewModel.champions.shuffled().prefix(4))
    }
    
    private func loadChampionStats() async {
        do {
            let stats = try await championStatsService.fetchChampionStats()
            championStatsByName = Dictionary(
                uniqueKeysWithValues: stats.map { ($0.normalizedChampionName, $0) }
            )
        } catch {
            championStatsByName = [:]
        }
    }
}

private struct SearchResultsSection: View {
    
    private let cardBackground = Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255)
    
    let champions: [Champion]
    @Binding var path: NavigationPath
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Filtered results")
                .font(.headline)
            
            if champions.isEmpty {
                Text("No filtered results.")
                    .foregroundColor(.secondary)
            } else {
                ForEach(champions) { champion in
                    Button {
                        path.append(HomeRoute.detail(champion))
                    } label: {
                        HStack {
                            AsyncImage(url: champion.iconURL) { phase in
                                switch phase {
                                case .empty:
                                    ProgressView()
                                        .frame(width: 40, height: 40)
                                case .success(let image):
                                    image
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 40, height: 40)
                                        .clipShape(RoundedRectangle(cornerRadius: 8))
                                case .failure:
                                    Image(systemName: "photo")
                                        .frame(width: 40, height: 40)
                                        .foregroundColor(.gray)
                                @unknown default:
                                    EmptyView()
                                }
                            }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(champion.name)
                                    .foregroundColor(.white)
                                    .bold()
                                Text(champion.title)
                                    .font(.subheadline)
                                    .foregroundColor(.white.opacity(0.7))
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.white.opacity(0.6))
                        }
                        .padding(12)
                        .background(cardBackground)
                        .cornerRadius(10)
                        .shadow(radius: 4)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.horizontal, 8)
    }
}
