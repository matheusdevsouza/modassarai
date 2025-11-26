'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaUserShield, FaDatabase, FaKey } from 'react-icons/fa';

interface AdminStatus {
  tokenIsAdmin: boolean;
  dbIsAdmin: boolean;
  userId: number | null;
  email: string | null;
  name: string | null;
  error: string | null;
}

export default function VerificarAcessoPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/verificar-status');
        const data = await response.json();
        
        if (data.success) {
          setStatus({
            tokenIsAdmin: data.tokenIsAdmin,
            dbIsAdmin: data.dbIsAdmin,
            userId: data.userId,
            email: data.email,
            name: data.name,
            error: null
          });
        } else {
          setStatus({
            tokenIsAdmin: false,
            dbIsAdmin: false,
            userId: null,
            email: null,
            name: null,
            error: data.error || 'Erro ao verificar status'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        setStatus({
          tokenIsAdmin: false,
          dbIsAdmin: false,
          userId: null,
          email: null,
          name: null,
          error: 'Erro ao conectar com o servidor'
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  const hasAccess = status?.dbIsAdmin === true;
  const tokenMatches = status?.tokenIsAdmin === status?.dbIsAdmin;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white mb-1">Verificação de Acesso Admin</h1>
        <p className="text-gray-400 text-sm">Verifique se seu usuário tem permissões de administrador</p>
      </motion.div>

      {status?.error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaTimesCircle className="text-red-400" size={24} />
            <h3 className="text-lg font-semibold text-red-300">Erro</h3>
          </div>
          <p className="text-red-400">{status.error}</p>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`border rounded-xl p-6 ${
              hasAccess
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {hasAccess ? (
                <FaCheckCircle className="text-green-400" size={24} />
              ) : (
                <FaTimesCircle className="text-red-400" size={24} />
              )}
              <h3 className={`text-lg font-semibold ${hasAccess ? 'text-green-300' : 'text-red-300'}`}>
                {hasAccess ? 'Acesso de Administrador Confirmado' : 'Acesso de Administrador Negado'}
              </h3>
            </div>
            <p className={hasAccess ? 'text-green-400' : 'text-red-400'}>
              {hasAccess
                ? 'Seu usuário possui permissões de administrador no banco de dados.'
                : 'Seu usuário não possui permissões de administrador no banco de dados.'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <FaKey className="text-[var(--logo-gold,#D4A574)]" size={20} />
                <h4 className="text-white font-semibold">Status no Token JWT</h4>
              </div>
              <div className="flex items-center gap-2">
                {status?.tokenIsAdmin ? (
                  <FaCheckCircle className="text-green-400" size={20} />
                ) : (
                  <FaTimesCircle className="text-red-400" size={20} />
                )}
                <span className={status?.tokenIsAdmin ? 'text-green-400' : 'text-red-400'}>
                  {status?.tokenIsAdmin ? 'Admin no Token' : 'Não Admin no Token'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Status de administrador armazenado no token de autenticação
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <FaDatabase className="text-[var(--logo-gold,#D4A574)]" size={20} />
                <h4 className="text-white font-semibold">Status no Banco de Dados</h4>
              </div>
              <div className="flex items-center gap-2">
                {status?.dbIsAdmin ? (
                  <FaCheckCircle className="text-green-400" size={20} />
                ) : (
                  <FaTimesCircle className="text-red-400" size={20} />
                )}
                <span className={status?.dbIsAdmin ? 'text-green-400' : 'text-red-400'}>
                  {status?.dbIsAdmin ? 'Admin no Banco' : 'Não Admin no Banco'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Status de administrador verificado diretamente no banco de dados
              </p>
            </motion.div>
          </div>

          {!tokenMatches && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaInfoCircle className="text-yellow-400" size={24} />
                <h3 className="text-lg font-semibold text-yellow-300">Aviso: Token Desatualizado</h3>
              </div>
              <p className="text-yellow-400 mb-4">
                O status de administrador no token JWT não corresponde ao status no banco de dados.
                Isso pode acontecer se você foi promovido a administrador após fazer login.
              </p>
              <p className="text-yellow-300 font-medium">
                Solução: Faça logout e login novamente para atualizar o token.
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaUserShield className="text-[var(--logo-gold,#D4A574)]" size={20} />
              <h4 className="text-white font-semibold">Informações do Usuário</h4>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400 text-sm">ID:</span>
                <span className="text-white ml-2">{status?.userId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Nome:</span>
                <span className="text-white ml-2">{status?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Email:</span>
                <span className="text-white ml-2">{status?.email || 'N/A'}</span>
              </div>
            </div>
          </motion.div>

          {!hasAccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl p-6"
            >
              <h4 className="text-white font-semibold mb-3">Como resolver o problema:</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-yellow-400 font-medium mb-2">Se você acabou de ser promovido a administrador:</h5>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                    <li>Faça <strong className="text-white">logout</strong> e <strong className="text-white">login novamente</strong> para atualizar o token JWT</li>
                    <li>O token JWT contém informações do momento do login, então precisa ser atualizado</li>
                    <li>Após fazer login novamente, verifique nesta página se o acesso foi concedido</li>
                  </ol>
                </div>
                <div className="border-t border-[#2a2a2a] pt-4">
                  <h5 className="text-yellow-400 font-medium mb-2">Se você ainda não é administrador:</h5>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                    <li>Entre em contato com outro administrador do sistema</li>
                    <li>Peça para que ele atualize seu status de administrador no painel de usuários</li>
                    <li>Após a atualização, faça logout e login novamente</li>
                    <li>Verifique novamente nesta página se o acesso foi concedido</li>
                  </ol>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                  <p className="text-yellow-300 text-sm">
                    <strong>Importante:</strong> Mesmo que o campo <code className="bg-[#0D0D0D] px-2 py-1 rounded">is_admin</code> esteja como <code className="bg-[#0D0D0D] px-2 py-1 rounded">true</code> no banco de dados, você precisa fazer logout e login novamente para que o token JWT seja atualizado com essa informação.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

