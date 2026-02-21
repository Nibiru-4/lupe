//
//  SecondSection.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//

import SwiftUI

struct SecondSection : View {
    private let cardWidth: CGFloat = 168
    
    let champions: [Champion]
    let statsByChampionName: [String: ChampionStats]
    let patchLinks: [PatchNoteLink]
    let onChampionTap: (Champion) -> Void
    
    var body : some View {
        VStack(spacing:24) {
            HStack( spacing: 16) {
                Image(systemName: "chart.bar")
                Text("home.second.section.title")
            }
            .frame(maxWidth: .infinity,alignment: .leading)
            
            LazyVGrid(columns: [GridItem(.adaptive(minimum: cardWidth, maximum: cardWidth), spacing: 16)], spacing: 16) {
                ForEach(champions) { champion in
                    Button {
                        onChampionTap(champion)
                    } label: {
                        CustomCard(
                            title: champion.name,
                            urlImage: champion.splashURL?.absoluteString ?? "",
                            winRate: statsByChampionName[champion.name.lowercased()]?.winRate,
                            pickRate: statsByChampionName[champion.name.lowercased()]?.pickRate
                        )
                        .frame(width: cardWidth)
                    }
                    .buttonStyle(.plain)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal,12)
            
            VStack {
                PatchComponent(title: String(localized: "home.patch.highlights"), links: patchLinks)
            }
           
        }
        
    
    }
}
