import SwiftUI
internal import Combine

struct ChampionDetailView: View {
    
    let champion: Champion
    @StateObject private var viewModel: ChampionDetailViewModel
    
    init(champion: Champion) {
        self.champion = champion
        _viewModel = StateObject(
            wrappedValue: ChampionDetailViewModel(championName: champion.name)
        )
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                AsyncImage(
                    url: champion.splashURL
                ) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(height: 220)
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(height: 220)
                            .clipped()
                            .cornerRadius(12)
                    case .failure:
                        Image(systemName: "photo")
                            .resizable()
                            .scaledToFit()
                            .frame(height: 120)
                            .foregroundColor(.gray)
                    @unknown default:
                        EmptyView()
                    }
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text(champion.name)
                        .font(.title)
                        .bold()
                    Text(champion.title)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                statsSection
            }
            .padding()
        }
        .navigationTitle(champion.name)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadStatsIfNeeded()
        }
    }
    
    @ViewBuilder
    private var statsSection: some View {
        if viewModel.isLoading && viewModel.stats == nil {
            ProgressView()
                .frame(maxWidth: .infinity, alignment: .center)
        } else if let stats = viewModel.stats {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Win Rate")
                    Spacer()
                    Text(String(format: "%.1f%%", stats.winRate))
                        .bold()
                }
                HStack {
                    Text("Pick Rate")
                    Spacer()
                    Text(String(format: "%.1f%%", stats.pickRate))
                        .bold()
                }
                
                if !stats.topBuilds.isEmpty {
                    Text("Most picked items")
                        .font(.headline)
                    
                    ForEach(Array(stats.topBuilds.enumerated()), id: \.offset) { index, build in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("Build #\(index + 1)")
                                    .font(.subheadline)
                                    .bold()
                                Spacer()
                                Text("\(build.count) games")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(build.items, id: \.self) { itemId in
                                        AsyncImage(url: Champion.itemIconURL(for: itemId)) { phase in
                                            switch phase {
                                            case .empty:
                                                ProgressView()
                                                    .frame(width: 32, height: 32)
                                            case .success(let image):
                                                image
                                                    .resizable()
                                                    .scaledToFill()
                                                    .frame(width: 32, height: 32)
                                                    .clipShape(RoundedRectangle(cornerRadius: 6))
                                            case .failure:
                                                Image(systemName: "questionmark.square")
                                                    .frame(width: 32, height: 32)
                                                    .foregroundColor(.gray)
                                            @unknown default:
                                                EmptyView()
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        .padding(10)
                        .background(Color.black.opacity(0.35))
                        .cornerRadius(10)
                    }
                }
            }
            .padding()
            .background(Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255))
            .cornerRadius(12)
        } else if let errorMessage = viewModel.errorMessage {
            Text(errorMessage)
                .foregroundColor(.red)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

@MainActor
private final class ChampionDetailViewModel: ObservableObject {
    @Published private(set) var stats: ChampionStats?
    @Published private(set) var isLoading = false
    @Published private(set) var errorMessage: String?
    
    private let championName: String
    private let service = ChampionStatsService()
    
    init(championName: String) {
        self.championName = championName
    }
    
    func loadStatsIfNeeded() async {
        guard stats == nil, !isLoading else { return }
        
        isLoading = true
        errorMessage = nil
        
        do {
            stats = try await service.fetchChampionStats(for: championName)
        } catch {
            errorMessage = "Unable to load champion stats."
        }
        
        isLoading = false
    }
}
