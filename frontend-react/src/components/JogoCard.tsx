import { IconCheck, IconStarFilled } from '@tabler/icons-react';
import type { Jogo } from '../types/models';
import { statusInfo } from '../types/status';
import { StatusIcon } from './StatusIcon';
import styles from './JogoCard.module.css';

function corFundo(nome: string): string {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return `linear-gradient(150deg, hsl(${hue}, 45%, 30%), hsl(${(hue + 40) % 360}, 42%, 16%))`;
}

interface Props {
  jogo: Jogo;
  status?: number | null;
  nota?: number | null;
  selecionado?: boolean;
  mostrarNome?: boolean;
  onClick?: () => void;
}

export function JogoCard({ jogo, status = null, nota = null, selecionado = false, mostrarNome = true, onClick }: Props) {
  const info = status !== null ? statusInfo(status) : null;

  return (
    <div className={`${styles.jc} ${selecionado ? styles.sel : ''}`} onClick={onClick}>
      <div className={styles.capa}>
        {jogo.capaUrl ? (
          <img className={styles.img} src={jogo.capaUrl} alt={jogo.nome} loading="lazy" />
        ) : (
          <div className={styles.ph} style={{ background: corFundo(jogo.nome) }}>
            <span>{jogo.nome}</span>
          </div>
        )}

        {info && status !== null && (
          <span
            className={styles.badge}
            style={{ background: `${info.cor}26`, color: info.cor, borderColor: `${info.cor}66` }}
          >
            <StatusIcon status={status} size={14} />
          </span>
        )}

        {!!nota && (
          <span className={styles.nota}>
            <IconStarFilled size={10} /> {nota}
          </span>
        )}

        {selecionado && (
          <span className={styles.check}>
            <span className={styles.checkIcon}>
              <IconCheck size={18} />
            </span>
          </span>
        )}
      </div>

      {mostrarNome && (
        <div className={styles.info}>
          <div className={styles.nome}>{jogo.nome}</div>
          {jogo.ano && <div className={styles.ano}>{jogo.ano}</div>}
        </div>
      )}
    </div>
  );
}
