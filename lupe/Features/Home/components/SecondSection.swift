//
//  SecondSection.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//

import SwiftUI

struct SecondSection : View {
    
    let champions: [Champion]
    let onChampionTap: (Champion) -> Void
    
    var body : some View {
        VStack(spacing:24) {
            HStack( spacing: 16) {
                Image(systemName: "chart.bar")
                Text("home.second.section.title")
            }
            .frame(maxWidth: .infinity,alignment: .leading)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                ForEach(champions) { champion in
                    Button {
                        onChampionTap(champion)
                    } label: {
                        CustomCard(
                            title: champion.name,
                            urlImage: champion.splashURL?.absoluteString ?? ""
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal,12)
            
            VStack {
                PatchComponent(title:"Patch Highlights")
            }
           
        }
        
    
    }
}
