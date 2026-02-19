import SwiftUI

struct CustomCard: View {
    
    let title: String
    let urlImage : String
    
    var body: some View {
        VStack(spacing: 8) {
            
            
            AsyncImage(url: URL(string: urlImage)) { phase in
                switch phase {
                case .empty:
                    ProgressView()
                        .frame(width: 100, height: 100)
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: 100, height: 100)
                        .clipShape(Circle())
                case .failure:
                    Image(systemName: "photo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 100, height: 100)
                        .foregroundColor(.gray)
                @unknown default:
                    EmptyView()
                }
            }
            
            Text(title)
                .font(.headline)
            
            Text("description")
                .font(.subheadline)
                .foregroundColor(.gray)
            
            HStack(spacing: 16) {
                Text("Win Rate")
                Spacer()
                Text("52%")
                    .bold()
            }
            
            HStack(spacing: 16) {
                Text("Pick Rate")
                Spacer()
                Text("2.9%")
                    .bold()
            }
        }
        .padding()
        .background(Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255))
        .cornerRadius(12)
        .shadow(radius: 4)
    }
}
