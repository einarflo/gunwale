import styled, { css, keyframes } from 'styled-components';
import { useContext } from 'react';
import { GameContext } from '../GameContext';
import { useI18n } from '../i18n/I18nProvider';

interface TopRightProps {
    points: number;
    color: string;
    textColor?: string;
    animate?: boolean;
    multicolor?: boolean;
}

const TopRightPoints = ({ points, color, textColor, animate, multicolor }: TopRightProps) => {
  const { nickname } = useContext(GameContext);
  const { t } = useI18n();
  return (
    <Wrapper hex={color} animate={animate} multicolor={multicolor}>
      <NameBlock text={textColor} title={nickname || ''}>{nickname || ''}</NameBlock>
      <PointsBox>
        <PointsValue>{Math.max(0, Number(points || 0))}</PointsValue>
        <PointsLabel>{t('common.pts')}</PointsLabel>
      </PointsBox>
    </Wrapper>
  );
};

export default TopRightPoints;

const MoveBackgroundPosition = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const MultiColorScroll = keyframes`
  0% { background-position: 50% 0%; }
  50% { background-position: 50% 100%; }
  100% { background-position: 50% 0%; }
`;

const NameBlock = styled.div.attrs((props: {text?: string}) => props)<{text?: string}>`
  color: ${props => props.text || 'white'};
  font-family: "Coll";
  font-weight: 800;
  font-size: 1rem;
  line-height: 1.1;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PointsBox = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  background: #ffffff;
  color: #1f2937;
  border-radius: 12px;
  padding: 6px 10px;
  min-width: 84px;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
`;

const PointsValue = styled.span`
  font-family: 'Coll';
  font-weight: 900;
  font-size: 1.25rem;
  line-height: 1;
  color: #3b82f6;
`;

const PointsLabel = styled.span`
  font-family: 'Coll';
  font-weight: 800;
  font-size: 0.8rem;
  color: #6b7280;
`;

const Wrapper = styled.div.attrs((props: {hex: any, animate?: boolean, multicolor?: boolean}) => props)<{hex: any, animate?: boolean, multicolor?: boolean}>`
  position: absolute;
  right: 0;
  top: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px 10px 14px;
  margin-right: 10px;
  border-radius: 14px;
  background: ${props => (props.hex)};
  ${props => props.animate && props.multicolor && css`
      background-size: 100% 1000%;
      animation: ${MultiColorScroll} 17.5s linear infinite;
  `}
  ${props => props.animate && !props.multicolor && css`
      background-size: 150%;
      animation: ${MoveBackgroundPosition} 6s ease-in-out infinite;
      filter: drop-shadow(0 0 1px rgba(255, 200, 0, .3));
  `}
  max-width: 80vw;
  box-shadow: 0 10px 28px rgba(0,0,0,0.15);
`;
