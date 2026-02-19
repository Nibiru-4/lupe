//
//  APIClient.swift
//  lupe
//
//  Created by Yassin Meghazi on 18/02/2026.
//
import Foundation

final class APIClient {
    static let shared = APIClient()
    private init() {}
    
    
    func fetch<T : Decodable>(url : URL) async throws -> T {
        let (data,response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              200..<300 ~= httpResponse.statusCode else {
            throw URLError(.badServerResponse)
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
}
