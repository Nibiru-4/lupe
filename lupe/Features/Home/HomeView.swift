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
    case playerHistory(gameName: String, tagLine: String)
}

struct HomeView: View {

    @StateObject private var viewModel = HomeChampionSearchViewModel()
    @State private var searchText = ""
    @State private var path = NavigationPath()
    @State private var featuredChampions: [Champion] = []
    @State private var championStatsByName: [String: ChampionStats] = [:]
    @State private var patchLinks: [PatchNoteLink] = []
    
    private let championStatsService = ChampionStatsService()
    private let patchNotesService = PatchNotesService()
    
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
                            patchLinks: patchLinks,
                            onChampionTap: { champion in
                                path.append(HomeRoute.detail(champion))
                            }
                        )
                    } else {
                        SearchResultsSection(
                            champions: filteredChampions,
                            playerQuery: parsePlayerQuery(from: searchText),
                            path: $path
                        )
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
                case .playerHistory(let gameName, let tagLine):
                    PlayerHistoryView(gameName: gameName, tagLine: tagLine)
                }
            }
            .task {
                await viewModel.loadChampions()
                await loadChampionStats()
                await loadPatchLinks()
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
        } else if let playerQuery = parsePlayerQuery(from: query) {
            path.append(HomeRoute.playerHistory(gameName: playerQuery.gameName, tagLine: playerQuery.tagLine))
        } else {
            path.append(HomeRoute.notFound(query))
        }
    }
    
    private func refreshFeaturedChampions() {
        featuredChampions = FeaturedChampionsStore.featuredChampions(from: viewModel.champions)
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
    
    private func loadPatchLinks() async {
        do {
            patchLinks = try await patchNotesService.fetchLatestPatchLinks(limit: 4)
        } catch {
            patchLinks = []
        }
    }

    private func parsePlayerQuery(from raw: String) -> (gameName: String, tagLine: String)? {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        let parts = trimmed.split(separator: "#", maxSplits: 1).map(String.init)
        guard parts.count == 2 else { return nil }

        let gameName = parts[0].trimmingCharacters(in: .whitespacesAndNewlines)
        let tagLine = parts[1].trimmingCharacters(in: .whitespacesAndNewlines)
        guard !gameName.isEmpty, !tagLine.isEmpty else { return nil }
        return (gameName, tagLine)
    }
}

private struct SearchResultsSection: View {
    
    private let cardBackground = Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255)
    
    let champions: [Champion]
    let playerQuery: (gameName: String, tagLine: String)?
    @Binding var path: NavigationPath
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("home.search.filtered_results")
                .font(.headline)

            if let playerQuery {
                Button {
                    path.append(HomeRoute.playerHistory(gameName: playerQuery.gameName, tagLine: playerQuery.tagLine))
                } label: {
                    HStack {
                        Image(systemName: "person.crop.circle.badge.magnifyingglass")
                            .foregroundColor(.white)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("home.search.search_player")
                                .foregroundColor(.white)
                                .bold()
                            Text("\(playerQuery.gameName)#\(playerQuery.tagLine)")
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.75))
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
            
            if champions.isEmpty {
                if playerQuery == nil {
                    Text("home.search.no_results")
                        .foregroundColor(.secondary)
                }
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
