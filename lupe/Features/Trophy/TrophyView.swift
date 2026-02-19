import SwiftUI

struct TrophyView: View {
    
    private let cardBackground = AppColors.accent_background
    
    @StateObject private var viewModel: ChampionViewModel
    @State private var selectedChampion: Champion?
    
    init(viewModel: ChampionViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel)
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.black
                    .ignoresSafeArea()
                
                List {
                    if viewModel.isLoading {
                        HStack {
                            Spacer()
                            ProgressView()
                            Spacer()
                        }
                    } else if let error = viewModel.errorMessage {
                        Text(error)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    } else {
                        ForEach(viewModel.champions) { champion in
                            Button {
                                selectedChampion = champion
                            } label: {
                                HStack(spacing: 12) {
                                    AsyncImage(url: champion.iconURL) { phase in
                                        switch phase {
                                        case .empty:
                                            ProgressView()
                                                .frame(width: 42, height: 42)
                                        case .success(let image):
                                            image
                                                .resizable()
                                                .scaledToFill()
                                                .frame(width: 42, height: 42)
                                                .clipShape(Circle())
                                        case .failure:
                                            Image(systemName: "photo")
                                                .frame(width: 42, height: 42)
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
                                            .foregroundColor(.white.opacity(0.8))
                                            .font(.subheadline)
                                    }
                                    
                                    Spacer()
                                    
                                    Image(systemName: "chevron.right")
                                        .foregroundColor(.white.opacity(0.7))
                                }
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(cardBackground)
                                .cornerRadius(12)
                                .shadow(radius: 4)
                            }
                            .buttonStyle(.plain)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                        }
                    }
                }
                .scrollContentBackground(.hidden)
                .background(Color.black)
                .listStyle(.plain)
            }
            .navigationDestination(item: $selectedChampion) { champion in
                ChampionDetailView(champion: champion)
            }
            .navigationTitle("Champions")
            .task {
                await viewModel.loadChampions()
            }
        }
    }
}
