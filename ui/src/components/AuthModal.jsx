import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Modal,
  ModalHeader,
  ModalContent,
  Button,
  FormField,
  Input,
  Alert,
  Tabs,
  TabList,
  TabTrigger,
  toast,
} from './ui';

export function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    modalMode,
    setModalMode,
    login,
    register,
  } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (modalMode === 'login') {
        await login(username, password);
        toast.success(`Welcome back, ${username}!`);
      } else {
        await register(username, password, email || null);
        toast.success('Registration successful. Welcome to Docubase!');
      }
      setUsername('');
      setPassword('');
      setEmail('');
    } catch (err) {
      const msg = err.message || 'Authentication failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={authModalOpen} onClose={() => setAuthModalOpen(false)} maxWidth="max-w-md">
      <ModalHeader
        title={modalMode === 'login' ? 'Sign In to Docubase' : 'Create an Account'}
        description={
          modalMode === 'login'
            ? 'Authenticate to access your private documents & knowledge base'
            : 'Register to upload, manage, and query your private documents'
        }
        onClose={() => setAuthModalOpen(false)}
      />

      <div className="px-6 pt-3">
        <Tabs value={modalMode} onChange={(val) => { setModalMode(val); setError(''); }}>
          <TabList variant="pills" className="w-full">
            <TabTrigger value="login" variant="pills" className="flex-1">
              Sign In
            </TabTrigger>
            <TabTrigger value="register" variant="pills" className="flex-1">
              Register New User
            </TabTrigger>
          </TabList>
        </Tabs>
      </div>

      <ModalContent className="pt-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="danger" onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}

          <FormField label="Username" required>
            <Input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alice or developer"
              autoFocus
            />
          </FormField>

          {modalMode === 'register' && (
            <FormField label="Email Address" hint="Used for account recovery and notifications.">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@example.com"
              />
            </FormField>
          )}

          <FormField label="Password" required>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full font-semibold"
            >
              {modalMode === 'login' ? 'Sign In' : 'Create Account & Sign In'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default AuthModal;
