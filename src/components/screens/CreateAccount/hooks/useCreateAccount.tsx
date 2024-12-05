import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext } from 'react'
import { AlertContext } from '../../../../contexts/alertContext'
import { INewUser, newUserSchema } from '../interfaces/INewUser'
import { httpClientProvider } from '../../../../providers/HttpClientProvider'
import { usersService } from '../../../../services/usersService'
import { ALERT_NOTIFY_TYPE } from '../../../../models/enums/AlertNotifyType'

export function useCreateAccount() {
  const { alertNotifyConfigs, setAlertNotifyConfigs } = useContext(AlertContext)
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<INewUser>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(newUserSchema),
  })

  const router = useRouter()

  async function onCreateAccount(newUser: INewUser) {
    try {
      await usersService.register({ ...newUser }, httpClientProvider)

      setAlertNotifyConfigs({
        ...alertNotifyConfigs,
        type: ALERT_NOTIFY_TYPE.SUCCESS,
        text: 'Usuário cadastrado com sucesso',
        open: true,
      })

      reset()
      router.push('/login')
    } catch (error: any) {
      console.error('ERRO AO TENTAR CADASTRAR USUÁRIO:', error)
      setAlertNotifyConfigs({
        ...alertNotifyConfigs,
        type: ALERT_NOTIFY_TYPE.ERROR,
        text: error?.message || 'Erro ao tentar cadastrar usuário',
        open: true,
      })
    }
  }

  return {
    register,
    handleSubmit,
    onCreateAccount,
    isSubmitting,
    errors,
  }
}
