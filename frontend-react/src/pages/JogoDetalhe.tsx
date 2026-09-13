import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon, Badge, Button, Center, Checkbox, Group, Loader, Modal, NumberInput, Select,
  Stack, Text, Textarea, Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft, IconHeart, IconHeartFilled, IconInfoCircle, IconPlus, IconRepeat, IconTrash,
} from '@tabler/icons-react';
import { useJogo, usePlataformas } from '../api/catalogo';
import {
  useAdicionarJogatina, usePorJogo, useRemoverDaBiblioteca, useRemoverJogatina, useAtualizarBiblioteca, useMarcar,
  type NovaJogatina,
} from '../api/biblioteca';
import { extractError } from '../api/client';
import { StatusIcon } from '../components/StatusIcon';
import { STATUS_LISTA, StatusJogo, statusInfo } from '../types/status';

const DEZ = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function corFundo(nome: string): string {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return `linear-gradient(150deg, hsl(${hue}, 45%, 30%), hsl(${(hue + 40) % 360}, 42%, 16%))`;
}

function formVazio(): NovaJogatina {
  return { plataformaId: null, ano: null, horas: null, status: StatusJogo.Zerado, ehRejogada: false, observacao: '' };
}

export function JogoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const jogoId = Number(id);
  const navigate = useNavigate();

  const { data: jogo, isLoading } = useJogo(jogoId);
  const { data: plataformas = [] } = usePlataformas();
  const { data: ujServidor } = usePorJogo(jogoId);

  const [uj, setUj] = useState(ujServidor ?? null);
  const [resenha, setResenha] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState<NovaJogatina>(formVazio());

  const marcar = useMarcar();
  const atualizar = useAtualizarBiblioteca();
  const adicionarJogatina = useAdicionarJogatina();
  const removerJogatina = useRemoverJogatina();
  const removerDaBiblioteca = useRemoverDaBiblioteca();

  useEffect(() => {
    setUj(ujServidor ?? null);
    setResenha(ujServidor?.resenha ?? '');
  }, [ujServidor]);

  function erro(e: unknown) {
    notifications.show({ color: 'red', title: 'Ops', message: extractError(e, 'Algo deu errado.') });
  }

  async function definirStatus(status: number) {
    try {
      const novo = await marcar.mutateAsync({ jogoId, status });
      setUj(novo);
      setResenha(novo.resenha ?? '');
    } catch (e) {
      erro(e);
    }
  }

  async function toggleFavorito() {
    if (!uj) return;
    try {
      const atualizado = await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { favorito: !uj.favorito } });
      setUj({ ...atualizado, jogatinas: uj.jogatinas });
    } catch (e) {
      erro(e);
    }
  }

  async function setNota(n: number) {
    if (!uj) return;
    try {
      const atualizado = await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { nota: n } });
      setUj({ ...atualizado, jogatinas: uj.jogatinas });
    } catch (e) {
      erro(e);
    }
  }

  async function salvarResenha() {
    if (!uj || (uj.resenha ?? '') === resenha) return;
    try {
      const atualizado = await atualizar.mutateAsync({ usuarioJogoId: uj.id, body: { resenha } });
      setUj({ ...atualizado, jogatinas: uj.jogatinas });
    } catch (e) {
      erro(e);
    }
  }

  function abrirDialog() {
    setForm(formVazio());
    setDialogAberto(true);
  }

  async function salvarJogatina() {
    if (!uj) return;
    try {
      const jt = await adicionarJogatina.mutateAsync({ usuarioJogoId: uj.id, body: form });
      setUj({ ...uj, jogatinas: [jt, ...uj.jogatinas] });
      setDialogAberto(false);
    } catch (e) {
      erro(e);
    }
  }

  async function onRemoverJogatina(jogatinaId: number) {
    if (!uj) return;
    try {
      await removerJogatina.mutateAsync(jogatinaId);
      setUj({ ...uj, jogatinas: uj.jogatinas.filter((x) => x.id !== jogatinaId) });
    } catch (e) {
      erro(e);
    }
  }

  async function onRemoverDaBiblioteca() {
    if (!uj) return;
    try {
      await removerDaBiblioteca.mutateAsync(uj.id);
      setUj(null);
    } catch (e) {
      erro(e);
    }
  }

  if (isLoading) {
    return <Center mih={300}><Loader /></Center>;
  }
  if (!jogo) return null;

  return (
    <Stack gap="lg">
      <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate(-1)} w="fit-content" px={0}>
        Voltar
      </Button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 280px) 1fr', gap: 36 }}>
        <div style={{ position: 'sticky', top: 90, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--mantine-color-dark-4)', aspectRatio: '3/4', height: 'fit-content' }}>
          {jogo.capaUrl ? (
            <img src={jogo.capaUrl} alt={jogo.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, textAlign: 'center', background: corFundo(jogo.nome) }}>
              <Text fw={800} fz={20} c="white">{jogo.nome}</Text>
            </div>
          )}
        </div>

        <div>
          <Title order={1}>{jogo.nome}</Title>
          <Group gap={8} mt="sm" mb={4}>
            {jogo.ano && <Text c="dimmed">{jogo.ano}</Text>}
            {jogo.generos.map((g) => <Badge key={g} variant="light">{g}</Badge>)}
            {!!jogo.metacritic && <Badge color="lime" variant="filled">Metacritic {jogo.metacritic}</Badge>}
          </Group>

          {jogo.plataformasDisponiveis.length > 0 && (
            <Group gap={6} mb={4}>
              <Text size="xs" c="dimmed">Disponível em:</Text>
              {jogo.plataformasDisponiveis.map((p) => <Badge key={p} variant="outline" size="sm">{p}</Badge>)}
            </Group>
          )}

          {jogo.tempoMedioHoras && (
            <Text size="xs" c="dimmed" mb={4}>Tempo médio pra zerar (comunidade): {jogo.tempoMedioHoras}h</Text>
          )}

          {jogo.dlcs.length > 0 && (
            <Group gap={6} mt={4}>
              <Text size="xs" c="dimmed">DLCs:</Text>
              {jogo.dlcs.map((d) => (
                <Badge key={d.id} variant="dot" size="sm" style={{ cursor: 'pointer' }} onClick={() => navigate(`/jogo/${d.id}`)}>
                  {d.nome}
                </Badge>
              ))}
            </Group>
          )}

          <Stack gap={10} mt="xl">
            <Text fw={700}>Status</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {STATUS_LISTA.map((s) => (
                <button
                  key={s.valor}
                  onClick={() => definirStatus(s.valor)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    background: uj?.status === s.valor ? `${s.cor}26` : 'var(--mantine-color-dark-6)',
                    border: `1px solid ${uj?.status === s.valor ? s.cor : 'var(--mantine-color-dark-4)'}`,
                    color: 'var(--mantine-color-white)', borderRadius: 12, padding: '12px 14px',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <StatusIcon status={s.valor} size={16} /> {s.label}
                </button>
              ))}
            </div>
          </Stack>

          {uj ? (
            <>
              <Group mt="xl" gap={40} align="flex-start">
                <div>
                  <Text fw={700} mb={10}>Sua nota</Text>
                  <Group gap={5}>
                    {DEZ.map((n) => (
                      <button
                        key={n}
                        onClick={() => setNota(n)}
                        style={{
                          width: 30, height: 34, borderRadius: 8,
                          background: (uj.nota ?? 0) >= n ? '#f5c518' : 'var(--mantine-color-dark-6)',
                          border: `1px solid ${(uj.nota ?? 0) >= n ? '#f5c518' : 'var(--mantine-color-dark-4)'}`,
                          color: (uj.nota ?? 0) >= n ? '#1a1a1a' : 'var(--mantine-color-dimmed)',
                          cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                    {!!uj.nota && (
                      <Button variant="subtle" color="gray" size="compact-xs" onClick={() => setNota(0)}>limpar</Button>
                    )}
                  </Group>
                </div>
                <div>
                  <Text fw={700} mb={10}>Favorito</Text>
                  <ActionIcon
                    size={50}
                    radius={12}
                    variant={uj.favorito ? 'light' : 'default'}
                    color={uj.favorito ? 'red' : 'gray'}
                    onClick={toggleFavorito}
                  >
                    {uj.favorito ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
                  </ActionIcon>
                </div>
              </Group>

              <Stack gap={10} mt="xl">
                <Text fw={700}>Resenha</Text>
                <Textarea
                  minRows={3}
                  autosize
                  placeholder="O que você achou desse jogo?"
                  value={resenha}
                  onChange={(e) => setResenha(e.currentTarget.value)}
                  onBlur={salvarResenha}
                />
              </Stack>

              <Stack gap={14} mt="xl">
                <Group justify="space-between">
                  <Text fw={700}>Suas jogatinas</Text>
                  <Button variant="subtle" size="compact-sm" leftSection={<IconPlus size={14} />} onClick={abrirDialog}>
                    Registrar
                  </Button>
                </Group>

                {uj.jogatinas.length === 0 ? (
                  <Text c="dimmed" size="sm">Nenhuma jogatina registrada. Marque quando e onde você jogou — inclusive rejogadas.</Text>
                ) : (
                  <Stack gap={10}>
                    {uj.jogatinas.map((jt) => {
                      const info = statusInfo(jt.status);
                      return (
                        <Group key={jt.id} gap={13} p={14} style={{ background: 'var(--mantine-color-dark-7)', border: '1px solid var(--mantine-color-dark-4)', borderRadius: 12 }}>
                          <Center w={36} h={36} style={{ borderRadius: 9, background: `${info.cor}26`, flexShrink: 0 }}>
                            <StatusIcon status={jt.status} size={18} />
                          </Center>
                          <div style={{ flex: 1 }}>
                            <Text size="sm" fw={600}>{jt.plataforma || 'Plataforma não informada'}</Text>
                            <Text size="xs" c="dimmed">
                              {info.label}
                              {jt.ano ? ` · ${jt.ano}` : ''}
                              {jt.horas ? ` · ${jt.horas}h` : ''}
                              {jt.ehRejogada ? ' · rejogada' : ''}
                            </Text>
                          </div>
                          {jt.ehRejogada && <IconRepeat size={16} opacity={0.6} />}
                          <ActionIcon variant="subtle" color="gray" onClick={() => onRemoverJogatina(jt.id)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      );
                    })}
                  </Stack>
                )}
              </Stack>

              <Button color="red" variant="light" leftSection={<IconTrash size={16} />} mt="lg" onClick={onRemoverDaBiblioteca}>
                Remover da biblioteca
              </Button>
            </>
          ) : (
            <Group gap={8} mt="xl" c="dimmed">
              <IconInfoCircle size={18} />
              <Text size="sm">Escolha um status acima para adicionar este jogo à sua biblioteca.</Text>
            </Group>
          )}
        </div>
      </div>

      <Modal opened={dialogAberto} onClose={() => setDialogAberto(false)} title="Registrar jogatina" centered>
        <Stack>
          <Select
            label="Plataforma"
            placeholder="Selecione"
            searchable
            data={plataformas.map((p) => ({ value: String(p.id), label: p.nome }))}
            value={form.plataformaId != null ? String(form.plataformaId) : null}
            onChange={(v) => setForm((f) => ({ ...f, plataformaId: v ? Number(v) : null }))}
          />
          <Group grow>
            <NumberInput label="Ano" placeholder="2024" value={form.ano ?? ''} onChange={(v) => setForm((f) => ({ ...f, ano: v === '' ? null : Number(v) }))} />
            <NumberInput label="Horas" placeholder="40" value={form.horas ?? ''} onChange={(v) => setForm((f) => ({ ...f, horas: v === '' ? null : Number(v) }))} />
          </Group>
          <Select
            label="Como terminou"
            data={STATUS_LISTA.map((s) => ({ value: String(s.valor), label: s.label }))}
            value={String(form.status)}
            onChange={(v) => setForm((f) => ({ ...f, status: v ? Number(v) : f.status }))}
          />
          <Checkbox
            label="Foi uma rejogada"
            checked={form.ehRejogada}
            onChange={(e) => setForm((f) => ({ ...f, ehRejogada: e.currentTarget.checked }))}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" color="gray" onClick={() => setDialogAberto(false)}>Cancelar</Button>
            <Button onClick={salvarJogatina} loading={adicionarJogatina.isPending}>Salvar</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
