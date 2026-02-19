//
//  UrlImage.swift
//  lupe
//
//  Created by Yassin Meghazi on 16/02/2026.
//
import SwiftUI

struct URLImageExample: View {
    
    let imageUrl = URL(string: "https://example.com/image.png")!
    
    var body: some View {
        AsyncImage(url: imageUrl) { phase in
            switch phase {
            case .empty:
                ProgressView()
            case .success(let image):
                image
                    .resizable()
                    .scaledToFit()
                    .frame(width: 100, height: 100)
            case .failure:
                Image(systemName: "photo")
            @unknown default:
                EmptyView()
            }
        }
    }
}

