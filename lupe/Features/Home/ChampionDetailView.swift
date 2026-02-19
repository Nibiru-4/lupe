import SwiftUI

struct ChampionDetailView: View {
    
    let champion: Champion
    
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
            }
            .padding()
        }
        .navigationTitle(champion.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}
