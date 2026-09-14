import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Avatar, Card, Center, Group, Loader, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconClockHour4, IconDeviceDesktop, IconTag, IconTrophy } from '@tabler/icons-react';
import { usePerfil } from '../api/perfil';
import { useBiblioteca } from '../api/biblioteca';
import type { DistribuicaoItem, UsuarioJogo } from '../types/models';
import { JogoCard } from '../components/JogoCard';
import { somarHoras } from '../utils/jogo';
import { chaveMesAno, formatarMesAno } from '../utils/data';

function chaveRecente(uj: UsuarioJogo): number {
  return Math.max(-1, ...uj.jogatinas.map((j) => chaveMesAno(j.mes, j.ano)));
}

function dataRecente(uj: UsuarioJogo): string {
  const comData = uj.jogatinas.filter((j) => j.ano);
  if (comData.length === 0) return `${somarHoras(uj)}h`;
  const maisRecente = comData.reduce((a, b) => (chaveMesAno(b.mes, b.ano) > chaveMesAno(a.mes, a.ano) ? b : a));
  return formatarMesAno(maisRecente.mes, maisRecente.ano) ?? `${somarHoras(uj)}h`;
}

function inicial(nome: string): string {
  return (nome?.trim()?.charAt(0) || '?').toUpperCase();
}

function pct(item: DistribuicaoItem, lista: DistribuicaoItem[]): number {
  const max = Math.max(...lista.map((d) => d.quantidade), 1);
  return Math.round((item.quantidade / max) * 100);
}

function Distribuicao({ titulo, itens, cor, vazio }: { titulo: string; itens: DistribuicaoItem[]; cor: string; vazio: string }) {
  return (
    <Card withBorder radius="md" p="lg">
      <Text fw={700} mb="md">{titulo}</Text>
      {itens.length ? (
        <Stack gap="sm">
          {itens.map((d) => (
            <Group key={d.rotulo} gap="md" wrap="nowrap">
              <Text size="sm" c="dimmed" w={110} style={{ flexShrink: 0 }}>{d.rotulo}</Text>
              <Progress value={pct(d, itens)} color={cor} flex={1} radius="xl" size="md" />
              <Text size="sm" fw={700} w={28} ta="right">{d.quantidade}</Text>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed">{vazio}</Text>
      )}
    </Card>
  );
}

function Ranking({ titulo, itens, onClickItem, subtitulo }: {
  titulo: string; itens: UsuarioJogo[]; onClickItem: (jogoId: number) => void; subtitulo?: (uj: UsuarioJogo) => string;
}) {
  return (
    <Card withBorder radius="md" p="lg">
      <Text fw={700} mb="md">{titulo}</Text>
      {itens.length === 0 ? (
        <Text size="sm" c="dimmed">Nada por aqui ainda.</Text>
      ) : (
        <Stack gap={10}>
          {itens.map((uj, i) => (
            <Group key={uj.id} gap="sm" wrap="nowrap" style={{ cursor: 'pointer' }} onClick={() => onClickItem(uj.jogo.id)}>
              <Text size="sm" c="dimmed" w={18} ta="right" style={{ flexShrink: 0 }}>{i + 1}</Text>
              <div style={{ width: 34, aspectRatio: '3/4', borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--mantine-color-dark-6)' }}>
                {uj.jogo.capaUrl && <img src={uj.jogo.capaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <Text size="sm" fw={600} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {uj.jogo.nome}
              </Text>
              <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>{subtitulo ? subtitulo(uj) : `${somarHoras(uj)}h`}</Text>
            </Group>
          ))}
        </Stack>
      )}
    </Card>
  );
}

export function Home() {
  const { data: perfil, isLoading } = usePerfil();
  const { data: biblioteca = [] } = useBiblioteca();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Center mih={300}>
        <Loader />
      </Center>
    );
  }

  if (!perfil) return null;
  const { usuario, estatisticas: e, favoritos } = perfil;

  const maisJogados = [...biblioteca].sort((a, b) => somarHoras(b) - somarHoras(a)).slice(0, 5);
  // Ordena pela data real da jogatina (mês/ano) quando informada; sem data, cai pra ordem
  // da API (AtualizadoEm desc), já que o índice original desempata de forma estável.
  const recentes = biblioteca
    .map((uj, i) => ({ uj, chave: chaveRecente(uj), i }))
    .sort((a, b) => b.chave - a.chave || a.i - b.i)
    .slice(0, 5)
    .map((x) => x.uj);

  return (
    <Stack gap="xl">
      <Group gap="lg">
        <Avatar size={78} radius="xl" color="blue" style={{ fontSize: 32, fontWeight: 800 }}>
          {inicial(usuario.nome)}
        </Avatar>
        <div>
          <Title order={1}>{usuario.nome}</Title>
          <Text c="dimmed">@{usuario.username}</Text>
          <Group gap="md">
            <Anchor component={Link} to={`/u/${usuario.username}`} size="sm">Ver perfil público</Anchor>
            <Anchor component={Link} to="/wrapped" size="sm">Ver meu Wrapped</Anchor>
          </Group>
        </div>
      </Group>

      {/* Horas jogadas em destaque — pedido explícito: hora e platina mais visíveis que o resto */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Card withBorder radius="md" p="xl" style={{ background: 'linear-gradient(135deg, rgba(79,156,255,0.12), transparent)' }}>
          <Group gap="lg" wrap="nowrap">
            <Center w={56} h={56} style={{ borderRadius: 14, background: 'rgba(79,156,255,0.15)', color: 'var(--mantine-color-blue-4)', flexShrink: 0 }}>
              <IconClockHour4 size={28} />
            </Center>
            <div>
              <Text fz={38} fw={900} lh={1}>{e.totalHoras}</Text>
              <Text fz={13} c="dimmed" fw={600} tt="uppercase">Horas jogadas</Text>
            </div>
          </Group>
        </Card>
        <Card withBorder radius="md" p="xl" style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.12), transparent)' }}>
          <Group gap="lg" wrap="nowrap">
            <Center w={56} h={56} style={{ borderRadius: 14, background: 'rgba(245,197,24,0.15)', color: '#f5c518', flexShrink: 0 }}>
              <IconTrophy size={28} />
            </Center>
            <div>
              <Text fz={38} fw={900} lh={1}>{e.platinados}</Text>
              <Text fz={13} c="dimmed" fw={600} tt="uppercase">Platinados</Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <StatTile num={e.totalJogos} label="Jogos" />
        <StatTile num={e.zerados} label="Zerados" color="green" />
        <StatTile num={e.abandonados} label="Abandonados" color="red" />
        <StatTile num={e.notaMedia ?? '—'} label="Nota média" color="violet" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <DestaqueCard icon={<IconDeviceDesktop size={22} />} label="Plataforma favorita" valor={e.plataformaFavorita} />
        <DestaqueCard icon={<IconTag size={22} />} label="Gênero favorito" valor={e.generoFavorito} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Ranking titulo="Mais jogados" itens={maisJogados} onClickItem={(id) => navigate(`/jogo/${id}`)} />
        <Ranking titulo="Jogados recentemente" itens={recentes} onClickItem={(id) => navigate(`/jogo/${id}`)} subtitulo={dataRecente} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Distribuicao titulo="Por plataforma" itens={e.porFamiliaPlataforma} cor="violet" vazio="Registre jogatinas com plataforma para ver isto." />
        <Distribuicao titulo="Por status" itens={e.porStatus} cor="teal" vazio="Nada por aqui ainda." />
      </SimpleGrid>

      {favoritos.length > 0 && (
        <div>
          <Text fw={700} mb="md">Favoritos</Text>
          <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="md">
            {favoritos.map((uj) => (
              <JogoCard
                key={uj.id}
                jogo={uj.jogo}
                status={uj.status}
                zerado={uj.zerado}
                platinado={uj.platinado}
                abandonado={uj.abandonado}
                nota={uj.nota}
                horas={somarHoras(uj)}
                onClick={() => navigate(`/jogo/${uj.jogo.id}`)}
              />
            ))}
          </SimpleGrid>
        </div>
      )}
    </Stack>
  );
}

function StatTile({ num, label, color }: { num: number | string; label: string; color?: string }) {
  return (
    <Card withBorder radius="md" p="lg" ta="center" style={{ borderTop: `3px solid var(--mantine-color-${color ?? 'gray'}-5)` }}>
      <Text fz={30} fw={800} c={color}>{num}</Text>
      <Text fz={12} c="dimmed" fw={600} tt="uppercase">{label}</Text>
    </Card>
  );
}

function DestaqueCard({ icon, label, valor }: { icon: React.ReactNode; label: string; valor?: string | null }) {
  return (
    <Card withBorder radius="md" p="lg">
      <Group gap="md">
        <Center w={46} h={46} bg="var(--mantine-color-blue-light)" style={{ borderRadius: 12, color: 'var(--mantine-color-blue-4)' }}>
          {icon}
        </Center>
        <div>
          <Text fz={12} c="dimmed" fw={600} tt="uppercase">{label}</Text>
          <Text fz={18} fw={700}>{valor || '—'}</Text>
        </div>
      </Group>
    </Card>
  );
}
