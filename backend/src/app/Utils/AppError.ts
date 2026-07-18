// Erreur métier avec un vrai code HTTP attaché.
// errorHandler.ts fait confiance à `err.statusCode` : sans elle, un `throw new
// Error(...)` classique retombe sur 500, et en production le message réel est
// alors masqué par un message générique ("Erreur interne du serveur") — ce qui
// cache par exemple un simple "Email ou mot de passe incorrect" derrière une
// fausse erreur serveur côté client.
export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    Object.setPrototypeOf(this, AppError.prototype)
  }
}
