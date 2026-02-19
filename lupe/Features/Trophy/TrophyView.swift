import SwiftUI

struct TrophyView: View {
    
    @StateObject private var viewModel: ChampionViewModel
    
    init(viewModel: ChampionViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel)
    }
    
    var body: some View {
        NavigationStack {
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
                        VStack(alignment: .leading, spacing: 4) {
                            Text(champion.name)
                                .foregroundColor(.white)
                                .bold()
                            Text(champion.title)
                                .foregroundColor(.white.opacity(0.8))
                                .font(.subheadline)
                        }
                        .padding(.vertical, 4)
                        .listRowBackground(Color.black)
                    }
                }
            }
            .listStyle(.plain)
            .background(Color.black)
            .navigationTitle("Champions")
            .task {
                await viewModel.loadChampions()
            }
        }
    }
}
