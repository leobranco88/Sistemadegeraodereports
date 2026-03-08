import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, serverTimestamp, orderBy
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, signOut as firebaseSignOut
} from "firebase/auth";
import { db, auth } from "./firebase";
import type { Report, Student, User } from "./types";

// ── AUTH ──────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  if (!snap.exists()) throw new Error("Usuário não encontrado no Firestore.");
  return { id: cred.user.uid, ...snap.data() } as User;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

// ── STUDENTS ──────────────────────────────────────────────────────────
export async function getStudents(professorId?: string): Promise<Student[]> {
  let q;
  if (professorId) {
    q = query(collection(db, "students"), where("professorId", "==", professorId));
  } else {
    q = query(collection(db, "students"), orderBy("name"));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
}

export async function addStudent(student: Omit<Student, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "students"), {
    ...student,
    createdAt: serverTimestamp()
  });
  return ref.id;
}

export async function updateStudent(id: string, data: Partial<Student>) {
  await updateDoc(doc(db, "students", id), data);
}

// ── REPORTS ───────────────────────────────────────────────────────────
export async function getReports(professorId?: string): Promise<Report[]> {
  let q;
  if (professorId) {
    q = query(
      collection(db, "reports"),
      where("professorId", "==", professorId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate(),
    updatedAt: d.data().updatedAt?.toDate(),
    sentAt: d.data().sentAt?.toDate(),
    confirmedAt: d.data().confirmedAt?.toDate(),
  } as Report));
}

export async function getReport(id: string): Promise<Report | null> {
  const snap = await getDoc(doc(db, "reports", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Report;
}

export async function createReport(report: Omit<Report, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "reports"), {
    ...report,
    status: "draft",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

export async function updateReport(id: string, data: Partial<Report>) {
  await updateDoc(doc(db, "reports", id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function sendReport(id: string) {
  await updateDoc(doc(db, "reports", id), {
    status: "sent",
    sentAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function confirmReport(id: string, meetingRequested: boolean, meetingDateTime?: string) {
  await updateDoc(doc(db, "reports", id), {
    status: "confirmed",
    confirmedAt: serverTimestamp(),
    meetingRequested,
    ...(meetingDateTime ? { meetingDateTime } : {}),
    updatedAt: serverTimestamp()
  });
}

// ── USERS ─────────────────────────────────────────────────────────────
export async function getUsers(role?: "professor" | "coordinator"): Promise<User[]> {
  let q;
  if (role) {
    q = query(collection(db, "users"), where("role", "==", role));
  } else {
    q = query(collection(db, "users"), orderBy("name"));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
}
