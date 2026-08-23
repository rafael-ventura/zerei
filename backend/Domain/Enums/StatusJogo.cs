namespace Zerei.Domain.Enums;

/// <summary>
/// Status de um jogo na biblioteca do usuário (ou de uma jogatina específica).
/// </summary>
public enum StatusJogo
{
    QueroJogar = 0,
    Jogando = 1,
    Jogado = 2,
    Zerado = 3,
    CemPorcento = 4,
    Platinado = 5,
    Abandonado = 6
}
