import React from 'react';
import styled, { keyframes } from 'styled-components';

const ripple = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(10);
  }
  100% {
    transform: scale(20);
    opacity: 0;
  }
`;

const Button = styled.button`
  position: relative;
  overflow: hidden;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  background-color: #008CBA;
  color: white;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 10px #999;
  transition: box-shadow 0.3s ease;

  &:after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, .5);
    border-radius: 100%;
    transform: scale(1);
    animation: ${ripple} 0.7s ease-out;
  }

  &:hover {
    box-shadow: 0 5px #666;
  }
`;

export default function RippleButton({ children, onClick }) {
  return <Button onClick={onClick}>{children}</Button>;
}