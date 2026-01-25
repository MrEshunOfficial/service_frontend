import { useParams } from "next/navigation";
import React from "react";

export default function page() {
  const params = useParams();
  const serviceToEdit = params.id as string;

  return <div>{serviceToEdit}</div>;
}
