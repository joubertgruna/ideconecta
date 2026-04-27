import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button.js';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'success'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'icon'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Botão Padrão', variant: 'default', size: 'md' },
};

export const Outline: Story = {
  args: { children: 'Contornado', variant: 'outline' },
};

export const Loading: Story = {
  args: { children: 'Carregando...', loading: true },
};

export const Destructive: Story = {
  args: { children: 'Excluir', variant: 'destructive' },
};
