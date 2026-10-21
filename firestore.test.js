const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const fs = require('fs');

let testEnv;

beforeAll(async () => {
  jest.setTimeout(30000);
  testEnv = await initializeTestEnvironment({
    projectId: "salimtravail",
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
}, 30000);

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

describe('Sabbaghi Firestore Security Rules', () => {

  const aliceId = 'alice_uid_123';
  const bobId = 'bob_uid_456';

  test('1. مستخدم مسجل يقرأ وثيقته ومشاريعه بنجاح', async () => {
    const aliceContext = testEnv.authenticatedContext(aliceId);
    const db = aliceContext.firestore();

    await assertSucceeds(db.collection('users').doc(aliceId).set({
      name: 'عيسى الصباغ',
      email: 'alice@example.com',
      uid: aliceId
    }));

    await assertSucceeds(db.collection('users').doc(aliceId).get());

    const projectRef = db.doc(`users/${aliceId}/projects/p1`);

    await assertSucceeds(projectRef.set({
      title: 'مشروع شقة',
      clientName: 'أحمد'
    }));

    await assertSucceeds(projectRef.get());
  }, 10000);

  test('2. مستخدم يحاول قراءة أو تعديل وثيقة مستخدم آخر أو مشاريعه', async () => {
    const aliceContext = testEnv.authenticatedContext(aliceId);
    const bobContext = testEnv.authenticatedContext(bobId);

    const aliceDb = aliceContext.firestore();
    const bobDb = bobContext.firestore();

    await assertSucceeds(aliceDb.collection('users').doc(aliceId).set({ name: 'أليس' }));
    const aliceProjectRef = aliceDb.doc(`users/${aliceId}/projects/p1`);
    await assertSucceeds(aliceProjectRef.set({ title: 'مشروع أليس' }));

    await assertFails(bobDb.collection('users').doc(aliceId).get());
    await assertFails(bobDb.doc(`users/${aliceId}/projects/p1`).get());
    await assertFails(bobDb.doc(`users/${aliceId}/projects/p1`).update({ title: 'اختراق' }));
  }, 10000);

  test('3. مستخدم غير مسجل يحاول الوصول إلى البيانات', async () => {
    const unauthContext = testEnv.unauthenticatedContext();
    const db = unauthContext.firestore();

    await assertFails(db.collection('users').doc(aliceId).get());
    await assertFails(db.doc(`users/${aliceId}/projects/p1`).get());
    await assertFails(db.collection('users').doc(aliceId).set({ name: 'زائر' }));
  }, 10000);

  test('4. إنشاء مشروع وتعديله وحذفه بواسطة المالك', async () => {
    const aliceContext = testEnv.authenticatedContext(aliceId);
    const db = aliceContext.firestore();

    const projRef = db.doc(`users/${aliceId}/projects/my_proj`);

    await assertSucceeds(projRef.set({ title: 'مشروع جديد', progress: 0 }));
    await assertSucceeds(projRef.update({ progress: 50 }));
    await assertSucceeds(projRef.delete());
  }, 10000);

  test('5. الوصول إلى أي مجموعة أو مسار غير مسموح (جذري أو وهمي)', async () => {
    const aliceContext = testEnv.authenticatedContext(aliceId);
    const db = aliceContext.firestore();

    await assertFails(db.collection('settings').doc('global').get());
    await assertFails(db.collection('public_data').doc('info').set({ test: 1 }));
  }, 10000);

  test('6. إنشاء ملف المستخدم وتحديثه بالطريقة التي يستخدمها AuthModal', async () => {
    const aliceContext = testEnv.authenticatedContext(aliceId);
    const db = aliceContext.firestore();

    const userRef = db.collection('users').doc(aliceId);

    await assertSucceeds(userRef.set({
      uid: aliceId,
      name: 'صباغ محترف',
      email: 'painter@example.com',
      phone: '0555000000',
      wilaya: 'الجزائر العاصمة',
      role: 'صباغ محترف',
      accountType: 'painter'
    }, { merge: true }));

    await assertSucceeds(userRef.set({
      phone: '0666111111'
    }, { merge: true }));
  }, 10000);

});
