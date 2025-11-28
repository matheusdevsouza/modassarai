# 🔧 INSTRUÇÕES PARA CORRIGIR O ERRO DE CONSTRAINT

## Problema
O erro `new row for relation "users" violates check constraint "users_phone_format"` ocorre porque a constraint no banco de dados não permite valores NULL corretamente.

## Solução

### 1. Execute o Script SQL no Supabase

Acesse o **Supabase SQL Editor** e execute o arquivo:
```
database/migrations/fix_constraints_URGENT.sql
```

Ou copie e cole este SQL:

```sql
-- Remover constraints antigas FORÇADAMENTE
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.users'::regclass 
        AND conname = 'users_phone_format'
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_phone_format CASCADE;
        RAISE NOTICE 'Constraint users_phone_format removida';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.users'::regclass 
        AND conname = 'users_cpf_format'
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT users_cpf_format CASCADE;
        RAISE NOTICE 'Constraint users_cpf_format removida';
    END IF;
END $$;

-- Recriar constraint de phone permitindo NULL explicitamente
ALTER TABLE public.users ADD CONSTRAINT users_phone_format CHECK (
    phone IS NULL OR 
    (
        phone IS NOT NULL 
        AND phone::text != ''
        AND phone::text != 'null'
        AND phone::text != 'NULL'
        AND LENGTH(TRIM(phone::text)) > 0
        AND (
            phone::text ~ '^\+?[0-9]{10,15}$' OR
            phone::text ~ '^\([0-9]{2}\)\s?[0-9]{4,5}-?[0-9]{4}$'
        )
    )
);

-- Recriar constraint de CPF permitindo NULL explicitamente
ALTER TABLE public.users ADD CONSTRAINT users_cpf_format CHECK (
    cpf IS NULL OR 
    (
        cpf IS NOT NULL 
        AND cpf::text != ''
        AND cpf::text != 'null'
        AND cpf::text != 'NULL'
        AND LENGTH(TRIM(cpf::text)) > 0
        AND (
            cpf::text ~ '^[0-9]{11}$' OR 
            cpf::text ~ '^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$'
        )
    )
);
```

### 2. Verifique se Funcionou

Execute este SQL para verificar:

```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
    AND conname IN ('users_phone_format', 'users_cpf_format');
```

As constraints devem mostrar `phone IS NULL OR ...` e `cpf IS NULL OR ...`.

### 3. Teste a Criação de Usuário

Após executar o script, tente criar um usuário novamente. O erro não deve mais ocorrer.

## Alterações no Código

O código já foi atualizado para:
- ✅ Garantir que valores vazios sejam convertidos para `NULL` explícito
- ✅ Adicionar logs de debug para rastrear o problema
- ✅ Melhorar o tratamento de NULL na função de criptografia

## Logs de Debug

Os logs agora mostram:
- `[CREATE_USER]` - Parâmetros antes da criptografia
- `[ENCRYPTION]` - Processo de criptografia de cada campo

Verifique o console do servidor para ver esses logs.

