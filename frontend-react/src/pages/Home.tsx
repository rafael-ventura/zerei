import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Avatar, Card, Center, Group, Loader, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconDeviceDesktop, IconTag } from '@tabler/icons-react';
import { usePerfil } from '../api/perfil';
import type { DistribuicaoItem } from '../types/models';
import { JogoCard } from '../components/JogoCard';

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

export function Home() {
  const { data: perfil, isLoading } = usePerfil();
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

      <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="md">
        <StatTile num={e.totalJogos} label="Jogos" />
        <StatTile num={e.zerados} label="Zerados" color="green" />
        <StatTile num={e.platinados} label="Platinados" color="yellow" />
        <StatTile num={e.totalHoras} label="Horas" color="blue" />
        <StatTile num={e.notaMedia ?? '—'} label="Nota média" color="violet" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <DestaqueCard icon={<IconDeviceDesktop size={22} />} label="Plataforma favorita" valor={e.plataformaFavorita} />
        <DestaqueCard icon={<IconTag size={22} />} label="Gênero favorito" valor={e.generoFavorito} />
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
              <JogoCard key={uj.id} jogo={uj.jogo} status={uj.status} nota={uj.nota} onClick={() => navigate(`/jogo/${uj.jogo.id}`)} />
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
