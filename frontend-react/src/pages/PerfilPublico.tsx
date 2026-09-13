import { useParams } from 'react-router-dom';
import { Avatar, Button, Center, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceDesktop, IconTag, IconUserMinus, IconUserPlus } from '@tabler/icons-react';
import { usePerfilPublico } from '../api/perfil';
import { useDeixarDeSeguir, useSeguir } from '../api/seguidor';
import { useAuth } from '../context/AuthContext';
import { extractError } from '../api/client';
import { JogoCard } from '../components/JogoCard';
import { somarHoras } from '../utils/jogo';

function inicial(nome: string): string {
  return (nome?.trim()?.charAt(0) || '?').toUpperCase();
}

export function PerfilPublico() {
  const { username } = useParams<{ username: string }>();
  const { usuario: eu } = useAuth();
  const { data: perfil, isLoading, error } = usePerfilPublico(username ?? '');
  const seguir = useSeguir();
  const deixarDeSeguir = useDeixarDeSeguir();

  async function toggleSeguir() {
    if (!perfil) return;
    try {
      if (perfil.voceSegue) await deixarDeSeguir.mutateAsync(perfil.usuario.id);
      else await seguir.mutateAsync(perfil.usuario.id);
    } catch (e) {
      notifications.show({ color: 'red', title: 'Ops', message: extractError(e, 'Algo deu errado.') });
    }
  }

  if (isLoading) return <Center mih={300}><Loader /></Center>;
  if (error || !perfil) return <Center mih={300}><Text c="dimmed">Usuário não encontrado.</Text></Center>;

  const { usuario, estatisticas: e, favoritos } = perfil;
  const ehVoceMesmo = eu?.username === usuario.username;

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Group gap="lg">
          <Avatar size={78} radius="xl" color="blue" style={{ fontSize: 32, fontWeight: 800 }}>
            {inicial(usuario.nome)}
          </Avatar>
          <div>
            <Title order={1}>{usuario.nome}</Title>
            <Text c="dimmed">@{usuario.username}</Text>
            <Group gap="md" mt={6}>
              <Text size="sm"><b>{perfil.seguidores}</b> <Text span c="dimmed">seguidores</Text></Text>
              <Text size="sm"><b>{perfil.seguindo}</b> <Text span c="dimmed">seguindo</Text></Text>
            </Group>
          </div>
        </Group>
        {!ehVoceMesmo && (
          <Button
            variant={perfil.voceSegue ? 'default' : 'filled'}
            leftSection={perfil.voceSegue ? <IconUserMinus size={16} /> : <IconUserPlus size={16} />}
            loading={seguir.isPending || deixarDeSeguir.isPending}
            onClick={toggleSeguir}
          >
            {perfil.voceSegue ? 'Deixar de seguir' : 'Seguir'}
          </Button>
        )}
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
                mostrarNome
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
    <div style={{ border: '1px solid var(--mantine-color-dark-4)', borderRadius: 12, padding: '20px 18px', textAlign: 'center', borderTop: `3px solid var(--mantine-color-${color ?? 'gray'}-5)` }}>
      <Text fz={30} fw={800} c={color}>{num}</Text>
      <Text fz={12} c="dimmed" fw={600} tt="uppercase">{label}</Text>
    </div>
  );
}

function DestaqueCard({ icon, label, valor }: { icon: React.ReactNode; label: string; valor?: string | null }) {
  return (
    <Group gap="md" p="lg" style={{ border: '1px solid var(--mantine-color-dark-4)', borderRadius: 12 }}>
      <Center w={46} h={46} bg="var(--mantine-color-blue-light)" style={{ borderRadius: 12, color: 'var(--mantine-color-blue-4)' }}>
        {icon}
      </Center>
      <div>
        <Text fz={12} c="dimmed" fw={600} tt="uppercase">{label}</Text>
        <Text fz={18} fw={700}>{valor || '—'}</Text>
      </div>
    </Group>
  );
}
