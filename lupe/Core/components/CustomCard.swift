import SwiftUI

struct CustomCard: View {
    private let cardHeight: CGFloat = 248
    private let imageSize: CGFloat = 92
    
    let title: String
    let urlImage : String
    let winRate: Double?
    let pickRate: Double?
    
    var body: some View {
        VStack(spacing: 8) {
            
            
            AsyncImage(url: URL(string: urlImage)) { phase in
                switch phase {
                case .empty:
                    ProgressView()
                        .frame(width: imageSize, height: imageSize)
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: imageSize, height: imageSize)
                        .clipShape(Circle())
                case .failure:
                    Image(systemName: "photo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: imageSize, height: imageSize)
                        .foregroundColor(.gray)
                @unknown default:
                    EmptyView()
                }
            }
            
            Text(title)
                .font(.headline)
            
            Text("home.meta.card.subtitle")
                .font(.subheadline)
                .foregroundColor(.gray)
            
            HStack(spacing: 16) {
                Text("stats.win_rate")
                Spacer()
                Text(formattedPercent(winRate))
                    .bold()
            }
            
            HStack(spacing: 16) {
                Text("stats.pick_rate")
                Spacer()
                Text(formattedPercent(pickRate))
                    .bold()
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .frame(height: cardHeight)
        .background(Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255))
        .cornerRadius(12)
        .shadow(radius: 4)
    }
    
    private func formattedPercent(_ value: Double?) -> String {
        guard let value else { return "--" }
        return String(format: "%.1f%%", value)
    }
}
