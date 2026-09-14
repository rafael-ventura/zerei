import { Link, NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom';
import { Avatar, Box, Container, Group, UnstyledButton } from '@mantine/core';
import { IconGridDots, IconLogout, IconPlus } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { RawgAttribution } from './RawgAttribution';

function inicial(nome: string): string {
  return (nome?.trim()?.charAt(0) || '?').toUpperCase();
}

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none',
  color: isActive ? 'var(--mantine-color-white)' : 'var(--mantine-color-dimmed)',
  background: isActive ? 'var(--mantine-color-dark-5)' : 'transparent',
});

export function Layout() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  function handleSair() {
    sair();
    navigate('/login');
  }

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(13,14,18,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--mantine-color-dark-4)',
        }}
      >
        <Container size="lg" h={64} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/" style={{ fontSize: 22, fontWeight: 800, textDecoration: 'none', color: 'inherit' }}>
            zerei<span style={{ color: 'var(--mantine-color-blue-5)' }}>.</span>
          </Link>
          <Group gap={4} style={{ flex: 1, minWidth: 0 }}>
            <RouterNavLink to="/" end style={navLinkStyle}>
              <IconGridDots size={18} /> <Box component="span" visibleFrom="sm">Início</Box>
            </RouterNavLink>
            <RouterNavLink to="/biblioteca" style={navLinkStyle}>
              <IconGridDots size={18} /> <Box component="span" visibleFrom="sm">Biblioteca</Box>
            </RouterNavLink>
            <RouterNavLink to="/onboarding" style={navLinkStyle}>
              <IconPlus size={18} /> <Box component="span" visibleFrom="sm">Adicionar</Box>
            </RouterNavLink>
          </Group>
          {usuario && (
            <Group gap={10}>
              <Avatar radius="xl" color="blue">{inicial(usuario.nome)}</Avatar>
              <UnstyledButton onClick={handleSair} title="Sair" p={8} style={{ borderRadius: 8 }}>
                <IconLogout size={18} />
              </UnstyledButton>
            </Group>
          )}
        </Container>
      </header>
      <Container size="lg" py="xl">
        <Outlet />
      </Container>
      <RawgAttribution />
    </>
  );
}
