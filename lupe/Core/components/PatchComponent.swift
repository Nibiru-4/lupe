import SwiftUI

struct PatchComponent: View {
    
    let title: String
    let links: [PatchNoteLink]
    private let cardBackground = Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255)
    private let accent = Color(red: 0x2f/255, green: 0xc7/255, blue: 0x83/255)
    
    var body: some View {
        VStack(spacing: 10) {
            
            Text(title)
                .font(.headline)
                .foregroundColor(.white)
            
            if links.isEmpty {
                Text("No patch links available.")
                    .foregroundColor(.secondary)
            } else {
                VStack(spacing: 10) {
                    ForEach(links) { link in
                        Link(destination: link.url) {
                            HStack {
                                Text(link.patch)
                                    .font(.caption.weight(.bold))
                                    .foregroundColor(accent)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(accent.opacity(0.14))
                                    .clipShape(Capsule())
                                
                                Text("Patch Notes")
                                    .foregroundColor(.white)
                                    .font(.subheadline.weight(.semibold))
                                Spacer()
                                Image(systemName: "arrow.up.right")
                                    .foregroundColor(accent)
                            }
                            .padding(12)
                            .background(
                                LinearGradient(
                                    colors: [Color.white.opacity(0.06), Color.white.opacity(0.02)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(accent.opacity(0.25), lineWidth: 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    }
                }
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .padding(.horizontal,12)
        .background(cardBackground)
        .cornerRadius(12)
        .shadow(radius: 4)
    }
}
