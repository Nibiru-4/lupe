//
//  Champion.swift
//  lupe
//
//  Created by Yassin Meghazi on 18/02/2026.
//

import Foundation

struct ChampionResponse : Codable {
    let data : [String : Champion]
}

struct Champion : Codable, Identifiable, Hashable {
    private static let cdnVersion = "14.2.1"
    
    let id : String
    let name : String
    let title : String
    
    var iconURL: URL? {
        URL(string: "https://ddragon.leagueoflegends.com/cdn/\(Self.cdnVersion)/img/champion/\(id).png")
    }
    
    var splashURL: URL? {
        URL(string: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/\(id)_0.jpg")
    }
    
    static func itemIconURL(for itemId: Int) -> URL? {
        URL(string: "https://ddragon.leagueoflegends.com/cdn/\(Self.cdnVersion)/img/item/\(itemId).png")
    }
}
