import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db";
import MainPage from "@/components/tracking-person/MainPage";

const PersonPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }
  const person = await prisma.trackPerson.findUnique({
    where: {
      id: id,
    },
  });

  if (!person) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <MainPage person={person} />
    </div>
  );
};

export default PersonPage;
