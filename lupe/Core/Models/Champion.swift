//
//  Champion.swift
//  lupe
//
//  Created by Yassin Meghazi on 18/02/2026.
//

struct ChampionResponse : Codable {
    let data : [String : Champion]
}

struct Champion : Codable, Identifiable {
    let id : String
    let name : String
    let title : String
}
