// composables/useConfirm.js
//
// Modal de confirmation animé, partagé par toute l'appli (état au niveau du
// module, donc une seule instance de <ConfirmModal /> - montée une fois dans
// AdminLayout / TeacherLayout - suffit à servir toutes les pages).
//
// Usage dans une page :
//   import { useConfirm } from '~~/composables/useConfirm'
//   const { confirm } = useConfirm()
//   const ok = await confirm({
//     title: 'Supprimer la session',
//     message: 'Cette action est irréversible.',
//     confirmLabel: 'Supprimer',
//     danger: true
//   })
//   if (!ok) return
//
import { ref } from 'vue'

const isOpen = ref(false)
const options = ref({
    title: 'Confirmer l\'action',
    message: 'Êtes-vous sûr de vouloir continuer ?',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    danger: false
})
let resolvePromise = null

export const useConfirm = () => {
    const confirm = (opts = {}) => {
        options.value = {
            title: opts.title || 'Confirmer l\'action',
            message: opts.message || 'Êtes-vous sûr de vouloir continuer ?',
            confirmLabel: opts.confirmLabel || 'Confirmer',
            cancelLabel: opts.cancelLabel || 'Annuler',
            danger: opts.danger ?? false
        }
        isOpen.value = true
        return new Promise((resolve) => {
            resolvePromise = resolve
        })
    }

    const handleConfirm = () => {
        isOpen.value = false
        if (resolvePromise) { resolvePromise(true); resolvePromise = null }
    }

    const handleCancel = () => {
        isOpen.value = false
        if (resolvePromise) { resolvePromise(false); resolvePromise = null }
    }

    return { isOpen, options, confirm, handleConfirm, handleCancel }
}
