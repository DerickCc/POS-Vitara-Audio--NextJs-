import toast from 'react-hot-toast';

export async function handleTableAction(
  action: (id: string) => Promise<string>,
  fetchData: () => Promise<void>,
  id: string
) {
  try {
    const message = await action(id);
    toast.success(message, { duration: 5000 });

    fetchData();
  } catch (e) {
    toast.error(e + '', { duration: 5000 });
  }
}
