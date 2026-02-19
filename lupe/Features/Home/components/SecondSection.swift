//
//  SecondSection.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//

import SwiftUI

struct SecondSection : View {
    
    var body : some View {
        VStack(spacing:24) {
            HStack( spacing: 16) {
                Image(systemName: "chart.bar")
                Text("home.second.section.title")
            }
            .frame(maxWidth: .infinity,alignment: .leading)
            
            VStack {
                HStack( spacing: 16) {
                    CustomCard(title: "Ahri", urlImage: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg")
                    CustomCard(title: "Yasuo",urlImage: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg")
                }
                HStack( spacing: 16) {
                    CustomCard(title: "Tryndamere",urlImage: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Tryndamere_0.jpg")
                    CustomCard(title: "Jax", urlImage: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jax_0.jpg")
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
