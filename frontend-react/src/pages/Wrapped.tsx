import { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Button, Center, Loader, SegmentedControl, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDownload } from '@tabler/icons-react';
import { usePerfil } from '../api/perfil';
import { useBiblioteca } from '../api/biblioteca';
import { API_BASE } from '../api/client';
import type { UsuarioJogo } from '../types/models';
import { anosComJogatina, somarHorasNoAno } from '../utils/jogo';
import styles from './Wrapped.module.css';

function capaProxied(url: string): string {
  return `${API_BASE}/imagem-proxy?url=${encodeURIComponent(url)}`;
}

interface DadosWrapped {
  totalHoras: number;
  totalJogos: number;
  zerados: number;
  notaMedia: number | null;
  generoFavorito: string | null;
  plataformaFavorita: string | null;
  destaques: UsuarioJogo[];
}

/** Estatísticas de um ano específico, calculadas a partir das jogatinas com esse ano informado. */
function statsDoAno(biblioteca: UsuarioJogo[], ano: number): DadosWrapped {
  const relevantes = biblioteca.filter((uj) => uj.jogatinas.some((jt) => jt.ano === ano));
  const totalHoras = Math.round(relevantes.reduce((s, uj) => s + somarHorasNoAno(uj, ano), 0) * 10) / 10;
  const zerados = relevantes.filter((uj) => uj.zerado).length;
  const notas = relevantes.filter((uj) => !!uj.nota).map((uj) => uj.nota!);
  const notaMedia = notas.length ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10 : null;

  const plataformas = new Map<string, number>();
  relevantes.forEach((uj) => uj.jogatinas
    .filter((jt) => jt.ano === ano && jt.plataforma)
    .forEach((jt) => plataformas.set(jt.plataforma!, (plataformas.get(jt.plataforma!) ?? 0) + 1)));
  const plataformaFavorita = [...plataformas.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const generos = new Map<string, number>();
  relevantes.forEach((uj) => uj.jogo.generos.forEach((g) => generos.set(g, (generos.get(g) ?? 0) + 1)));
  const generoFavorito = [...generos.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const destaques = [...relevantes].sort((a, b) => somarHorasNoAno(b, ano) - somarHorasNoAno(a, ano));

  return { totalHoras, totalJogos: relevantes.length, zerados, notaMedia, generoFavorito, plataformaFavorita, destaques };
}

export function Wrapped() {
  const { data: perfil, isLoading: carregandoPerfil } = usePerfil();
  const { data: biblioteca = [], isLoading: carregandoBiblioteca } = useBiblioteca();
  const cardRef = useRef<HTMLDivElement>(null);
  const [baixando, setBaixando] = useState(false);
  const [periodo, setPeriodo] = useState('geral');

  const anos = useMemo(() => anosComJogatina(biblioteca), [biblioteca]);

  async function baixar() {
    if (!cardRef.current) return;
    setBaixando(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      link.download = `zerei-wrapped-${perfil?.usuario.username ?? 'eu'}-${periodo}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      notifications.show({ color: 'red', title: 'Ops', message: 'Não foi possível gerar a imagem.' });
    } finally {
      setBaixando(false);
    }
  }

  if (carregandoPerfil || carregandoBiblioteca) return <Center mih={300}><Loader /></Center>;
  if (!perfil) return null;

  const { usuario, estatisticas: e, favoritos } = perfil;

  const dados: DadosWrapped = periodo === 'geral'
    ? {
      totalHoras: e.totalHoras, totalJogos: e.totalJogos, zerados: e.zerados, notaMedia: e.notaMedia ?? null,
      generoFavorito: e.generoFavorito ?? null, plataformaFavorita: e.plataformaFavorita ?? null, destaques: favoritos,
    }
    : statsDoAno(biblioteca, Number(periodo));

  const rotuloPeriodo = periodo === 'geral' ? 'DE TODOS OS TEMPOS' : periodo;

  return (
    <Stack align="center" gap="lg">
      <div>
        <Title order={1} ta="center">Seu Wrapped</Title>
        <Text c="dimmed" ta="center" mt={6}>Um resumo bonito da sua jornada — pra baixar e compartilhar.</Text>
      </div>

      {anos.length > 0 && (
        <SegmentedControl
          value={periodo}
          onChange={setPeriodo}
          data={[{ label: 'Vida toda', value: 'geral' }, ...anos.map((a) => ({ label: String(a), value: String(a) }))]}
        />
      )}

      <div ref={cardRef} className={styles.card}>
        <div className={styles.brand}>zerei<span>.</span></div>
        <Text className={styles.kicker}>WRAPPED {rotuloPeriodo} DE {usuario.nome.split(' ')[0].toUpperCase()}</Text>

        <div className={styles.heroNum}>{dados.totalHoras}</div>
        <div className={styles.heroLabel}>horas jogadas</div>

        <div className={styles.grid}>
          <div className={styles.stat}>
            <div className={styles.statNum}>{dados.totalJogos}</div>
            <div className={styles.statLabel}>jogos</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{dados.zerados}</div>
            <div className={styles.statLabel}>zerados</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{dados.notaMedia ?? '—'}</div>
            <div className={styles.statLabel}>nota média</div>
          </div>
        </div>

        {(dados.generoFavorito || dados.plataformaFavorita) && (
          <div className={styles.destaques}>
            {dados.generoFavorito && (
              <div className={styles.destaque}><span>Gênero favorito</span><strong>{dados.generoFavorito}</strong></div>
            )}
            {dados.plataformaFavorita && (
              <div className={styles.destaque}><span>Plataforma favorita</span><strong>{dados.plataformaFavorita}</strong></div>
            )}
          </div>
        )}

        {dados.destaques.length > 0 && (
          <div className={styles.capas}>
            {dados.destaques.slice(0, 5).map((uj) => (
              uj.jogo.capaUrl ? (
                <img key={uj.id} src={capaProxied(uj.jogo.capaUrl)} alt={uj.jogo.nome} className={styles.capa} crossOrigin="anonymous" />
              ) : null
            ))}
          </div>
        )}

        <div className={styles.footer}>@{usuario.username} · zerei.app</div>
      </div>

      <Button leftSection={<IconDownload size={16} />} loading={baixando} onClick={baixar}>
        Baixar imagem
      </Button>
    </Stack>
  );
}
