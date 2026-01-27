export default async function BlogPost({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = await params;
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${blogId}`,
  );
  const data = await response.json();
  return <div>{data.title}</div>;
}
