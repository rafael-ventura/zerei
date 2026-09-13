namespace Zerei.Domain.Enums;

/// <summary>
/// Eixo de engajamento de um jogo na biblioteca do usuário (ou de uma jogatina específica) —
/// mutuamente exclusivo. Zerado/Platinado/Abandonado são flags independentes em <see cref="Zerei.Domain.Entities.UsuarioJogo"/>
/// e <see cref="Zerei.Domain.Entities.Jogatina"/>, não fazem mais parte deste enum: todo jogo Zerado
/// também foi Jogado, todo Platinado também foi Zerado, então tratá-los como valores que se
/// excluem mutuamente não fazia sentido.
/// </summary>
public enum StatusJogo
{
    QueroJogar = 0,
    Jogando = 1,
    Jogado = 2
}
