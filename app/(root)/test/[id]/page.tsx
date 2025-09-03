"use client";
import { useParams } from "next/navigation";

export default function TestPage() {
  const params = useParams();
  const id = params?.id;
  
  return (
    <div className="p-8">
      <h1>Test Page</h1>
      <p>ID: {id}</p>
    </div>
  );
}
