"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext } from "react";

export default function ArticleArea() {
  const [{ plurks }] = useContext(PlurksDataContext);

  return (
    <>
      {plurks.map((plurk) => (
        <p key={plurk.id}>{plurk.content}</p>
      ))}
    </>
  );
}
