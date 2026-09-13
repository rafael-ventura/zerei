import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Button, Center, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import { extractError } from '../api/client';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [emailOuUsername, setEmailOuUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!emailOuUsername || !senha) return;
    setCarregando(true);
    try {
      await login(emailOuUsername, senha);
      navigate('/');
    } catch (e) {
      notifications.show({ color: 'red', title: 'Ops', message: extractError(e, 'Não foi possível entrar.') });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Center mih="100vh">
      <Paper withBorder radius="md" p="xl" w={380}>
        <Stack gap="xs" mb="lg">
          <Title order={2}>
            zerei<Text span c="blue">.</Text>
          </Title>
          <Text c="dimmed" size="sm">Sua estante de jogos. Tudo que você já jogou, num lugar só.</Text>
        </Stack>
        <Stack>
          <TextInput
            label="E-mail ou usuário"
            placeholder="voce@email.com"
            autoComplete="username"
            value={emailOuUsername}
            onChange={(e) => setEmailOuUsername(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && entrar()}
          />
          <PasswordInput
            label="Senha"
            placeholder="••••••••"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && entrar()}
          />
          <Button fullWidth loading={carregando} onClick={entrar}>Entrar</Button>
          <Text size="sm" ta="center">
            Não tem conta? <Anchor component={Link} to="/registro">Criar conta</Anchor>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
