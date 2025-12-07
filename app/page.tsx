'use client'

import supabase from "./api/lib/db";
import { Idesc } from "./api/types/desc";
import { useState, useEffect } from "react";
import LoginPage from "./login/page";

export default function Home() {
  const [ descs, setDescs ] = useState<Idesc[]>([]);

  useEffect (() => {
    const fetchDescs = async () => {
      const { data, error } = await supabase.from('infoar').select('*');

      if (error) console.log ('error: ', error);
      else setDescs(data);
    };

    fetchDescs();
  }, [supabase]);

  console.log(descs);
  return (
    <>
      <LoginPage/>
    </>
  );
}
