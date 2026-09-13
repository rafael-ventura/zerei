import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Button, Center, Loader, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDownload } from '@tabler/icons-react';
import { usePerfil } from '../api/perfil';
import { API_BASE } from '../api/client';
import styles from './Wrapped.module.css';

function capaProxied(url: string): string {
  return `${API_BASE}/imagem-proxy?url=${encodeURIComponent(url)}`;
}

export function Wrapped() {
  const { data: perfil, isLoading } = usePerfil();
  const cardRef = useRef<HTMLDivElement>(null);
  const [baixando, setBaixando] = useState(false);

  async function baixar() {
    if (!cardRef.current) return;
    setBaixando(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      link.download = `zerei-wrapped-${perfil?.usuario.username ?? 'eu'}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      notifications.show({ color: 'red', title: 'Ops', message: 'Não foi possível gerar a imagem.' });
    } finally {
      setBaixando(false);
    }
  }

  if (isLoading) return <Center mih={300}><Loader /></Center>;
  if (!perfil) return null;

  const { usuario, estatisticas: e, favoritos } = perfil;

  return (
    <Stack align="center" gap="lg">
      <div>
        <Title order={1} ta="center">Seu Wrapped</Title>
        <Text c="dimmed" ta="center" mt={6}>Um resumo bonito da sua jornada — pra baixar e compartilhar.</Text>
      </div>

      <div ref={cardRef} className={styles.card}>
        <div className={styles.brand}>zerei<span>.</span></div>
        <Text className={styles.kicker}>WRAPPED DE {usuario.nome.split(' ')[0].toUpperCase()}</Text>

        <div className={styles.heroNum}>{e.totalHoras}</div>
        <div className={styles.heroLabel}>horas jogadas</div>

        <div className={styles.grid}>
          <div className={styles.stat}>
            <div className={styles.statNum}>{e.totalJogos}</div>
            <div className={styles.statLabel}>jogos</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{e.zerados}</div>
            <div className={styles.statLabel}>zerados</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{e.notaMedia ?? '—'}</div>
            <div className={styles.statLabel}>nota média</div>
          </div>
        </div>

        {(e.generoFavorito || e.plataformaFavorita) && (
          <div className={styles.destaques}>
            {e.generoFavorito && (
              <div className={styles.destaque}><span>Gênero favorito</span><strong>{e.generoFavorito}</strong></div>
            )}
            {e.plataformaFavorita && (
              <div className={styles.destaque}><span>Plataforma favorita</span><strong>{e.plataformaFavorita}</strong></div>
            )}
          </div>
        )}

        {favoritos.length > 0 && (
          <div className={styles.capas}>
            {favoritos.slice(0, 5).map((uj) => (
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
