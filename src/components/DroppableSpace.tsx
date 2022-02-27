import React from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import { ItemType } from './ItemType';

export type DropResult = {
  pos: number;
};

const DroppableSpan = styled.span<{ isOver: boolean }>`
  ${({ isOver }) => isOver && 'background-color: aqua'}
`;

export const DroppableSpace = (props: { text: string; pos: number }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (): DropResult => {
      return {
        pos: props.pos,
      };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const text = props.text || '';
  return (
    <DroppableSpan ref={drop} isOver={isOver}>
      {text}
    </DroppableSpan>
  );
};
