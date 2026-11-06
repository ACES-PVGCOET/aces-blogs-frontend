import { User, Badge, Team, Blog, WriterProfile } from "./types";

/**
 * Sample earned badges to test the filled state.
 */
export const mockSampleBadges: Badge[] = [
  {
    id: "badge-1",
    name: "Primeira Vitória",
    iconUrl: null,
    earnedAt: "2020-04-12T10:00:00.000Z",
  },
  {
    id: "badge-2",
    name: "Explorador da Floresta",
    iconUrl: null,
    earnedAt: "2020-05-01T14:20:00.000Z",
  },
];

/**
 * Primary user profile mock.
 */
export const mockUser: User = {
  id: "user-1",
  name: "Aarav Sharma",
  email: "aarav.sharma@aces.pvgcoet.ac.in",
  school: "Department of Computer Engineering · PVGCOET",
  city: "Pune, Maharashtra",
  age: 21,
  hometown: "Pune, MH",
  companion: "aarav_writes",
  lastAccess: "2026-03-24T18:45:00.000Z",
  rankTitle: "Systems Lead & Fellow",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  bannerUrl: "/images/banner-placeholder.jpg",
  badges: mockSampleBadges,
};

export const mockUserWithBadges: User = {
  ...mockUser,
  id: "user-2",
  badges: mockSampleBadges,
};

/**
 * ACES Broadsheet Gazette Writer Profile
 */
export const mockWriterProfile: WriterProfile = {
  id: "writer-101",
  name: "Aarav Sharma",
  username: "aarav_writes",
  role: "WRITER",
  status: "ACTIVE",
  profileImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  linkedIn: "https://linkedin.com/in/aarav-sharma",
  github: "https://github.com/aarav-sharma",
  bio: "Core Committee Member @ ACES PVGCOET. Writing deep technical breakdowns on distributed consensus algorithms, Linux eBPF telemetry, and modern compiler memory safety.",
  labels: [
    { key: "core-contributor", text: "TOP CONTRIBUTOR '25", emoji: "★", awarded: true, awardedBy: "ACES Editorial Board", awardedAt: "2025-01-10T10:00:00Z" },
    { key: "sys-track", text: "SYSTEMS LEAD", emoji: "⚡", awarded: false, awardedBy: "ACES Faculty Committee", awardedAt: "2025-02-14T12:00:00Z" }
  ],
  createdAt: "2024-02-15T09:00:00.000Z"
};

/**
 * Technical Dispatches / Blogs
 */
export const mockBlogs: Blog[] = [
  {
    id: "11111111-1111-4111-a111-111111111111",
    slug: "understanding-linux-ebpf-tracing",
    title: "Deep Dive into Linux eBPF Tracing for Cloud-Native Observability",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    author: "writer-101",
    authorName: "Aarav Sharma",
    authorHandle: "@aarav_writes",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    reviewer: "Dr. A. Patil · Faculty Lead",
    status: "PUBLISHED",
    category: "Kernel & OS",
    tags: ["linux", "kernel", "ebpf", "observability", "systems"],
    readsCount: 14200,
    readTime: "7 min read",
    rejectionReason: null,
    latestRevisionVersion: 2,
    latestPublishedVersion: 2,
    createdAt: "2024-03-01T10:00:00.000Z",
    modifiedAt: "2024-03-24T14:30:00.000Z",
    excerpt: "High-throughput kernel tracing and zero-overhead observability for distributed cloud-native microservices.",
    content: `
### The Architectural Shift in Linux Telemetry

For decades, systems engineers investigating production latency bottlenecks were forced to choose between blunt user-space profiling tools and heavy in-kernel instrumentation modules. Extended Berkeley Packet Filter (eBPF) fundamentally changes this calculus by executing sandboxed, bytecode-verified programs directly inside the Linux kernel at runtime without patching kernel sources or loading risky kernel modules.

\`\`\`c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("tracepoint/syscalls/sys_enter_execve")
int trace_enter_execve(struct trace_event_raw_sys_enter *ctx) {
    char comm[16];
    bpf_get_current_comm(&comm, sizeof(comm));
    bpf_printk("ACES eBPF Dispatch: execve spawned by %s\\n", comm);
    return 0;
}

char LICENSE[] SEC("license") = "GPL";
\`\`\`

### Verification and Safety Guarantees

The eBPF verifier is arguably the most critical component in this architecture. Before bytecode can be attached to a kprobe, tracepoint, or XDP hook, the kernel statically executes the bytecode through every execution path to mathematically guarantee:

1. **No Infinite Loops:** Backward jumps are strictly checked or bound by compiler limits.
2. **Deterministic Memory Access:** Out-of-bounds pointer dereferences trigger immediate verifier rejection.
3. **Restricted Call Stacks:** Stack frame size is capped at 512 bytes to preserve kernel continuity.

> *"With eBPF, observability transforms from an intrusive afterthought into a zero-cost ambient property of the host operating system."*

### Empirical Production Benchmarks

In comparative load testing conducted on dual-socket AMD EPYC clusters at the ACES Systems Lab, hooking socket telemetry via eBPF kprobes reduced metric aggregation overhead by 83% compared to conventional ptrace-based interceptors. Network throughput remained steady across 200,000 requests per second with sub-millisecond tail jitter.
`
  },
  {
    id: "22222222-2222-4222-a222-222222222222",
    slug: "rust-memory-safety-patterns",
    title: "Memory Safety Without Garbage Collection: How Rust Rewrote the Rules",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    author: "writer-101",
    authorName: "Aarav Sharma",
    authorHandle: "@aarav_writes",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    reviewer: "Prof. S. Kulkarni · Compilers Chair",
    status: "PUBLISHED",
    category: "Systems & Compilers",
    tags: ["rust", "memory", "concurrency", "type-systems"],
    readsCount: 9800,
    readTime: "6 min read",
    rejectionReason: null,
    latestRevisionVersion: 3,
    latestPublishedVersion: 2,
    createdAt: "2024-03-10T08:15:00.000Z",
    modifiedAt: "2024-03-26T18:45:00.000Z",
    excerpt: "How lifetime bounds, affine type systems, and ownership semantics eliminated data races without garbage collection.",
    content: `
### The Historic Dichotomy of Systems Programming

For fifty years, systems programming existed under a strict binary: either manual allocation in C/C++ with the persistent specter of use-after-free vulnerabilities, or managed runtimes with stop-the-world garbage collection pauses that precluded hard real-time guarantees.

Rust demolished this trade-off using an affine type system combined with compile-time lifetime analysis.

\`\`\`rust
pub struct BroadsheetBuffer<'a> {
    stream: &'a [u8],
    cursor: usize,
}

impl<'a> BroadsheetBuffer<'a> {
    pub fn read_packet(&mut self, length: usize) -> Result<&'a [u8], &'static str> {
        if self.cursor + length > self.stream.len() {
            return Err("Buffer overrun detected at compile-verified boundary");
        }
        let slice = &self.stream[self.cursor..self.cursor + length];
        self.cursor += length;
        Ok(slice)
    }
}
\`\`\`

### Affine Types and Single Ownership

Every resource in a Rust binary has a single clear owner. When the owner drops out of lexical scope, the destructor (\`Drop\`) is synthesized automatically at compile time. Data races are ruled out because shared references (\`&T\`) are immutable, while mutable references (\`&mut T\`) are provably exclusive across threads.
`
  },
  {
    id: "33333333-3333-4333-a333-333333333333",
    slug: "raft-consensus-visualization-go",
    title: "Building an Interactive Raft Consensus Visualizer in Go",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    author: "writer-101",
    authorName: "Aarav Sharma",
    authorHandle: "@aarav_writes",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    reviewer: "Prof. S. Kulkarni · Compilers Chair",
    status: "UNDER_REVIEW",
    category: "Distributed Systems",
    tags: ["raft", "consensus", "golang", "distributed-systems"],
    readsCount: 0,
    readTime: "8 min read",
    rejectionReason: null,
    latestRevisionVersion: 1,
    latestPublishedVersion: 0,
    createdAt: "2024-03-18T11:00:00.000Z",
    modifiedAt: "2024-03-25T09:20:00.000Z",
    excerpt: "Benchmarking Raft leader election vs. Byzantine fault tolerance under asymmetric cross-region network partitions.",
    content: `
### State Machine Replication and Understandability

While Paxos proved mathematically foundational, Raft was formulated specifically with decomposability and cognitive ergonomics at its core. By segregating leader election, log replication, and safety constraints into disjoint sub-problems, Raft enables robust implementations.

In this dispatch, we walk through building a deterministic simulator in Go with WebSockets streaming log indices directly to an SVG canvas.
`
  },
  {
    id: "44444444-4444-4444-a444-444444444444",
    slug: "zero-knowledge-proofs-for-engineers",
    title: "Demystifying Zero-Knowledge Rollups for Everyday Software Engineers",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80",
    author: "writer-101",
    authorName: "Aarav Sharma",
    authorHandle: "@aarav_writes",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    reviewer: null,
    status: "DRAFT",
    category: "Applied Cryptography",
    tags: ["zkp", "crypto", "security", "math"],
    readsCount: 0,
    readTime: "5 min read",
    rejectionReason: null,
    latestRevisionVersion: 1,
    latestPublishedVersion: 0,
    createdAt: "2024-03-20T16:00:00.000Z",
    modifiedAt: "2024-03-27T07:10:00.000Z",
    excerpt: "Mathematical fundamentals of polynomial commitments and arithmetic circuits for zero-knowledge verifiable compute.",
    content: `
### Proving Without Revealing

Zero-knowledge rollups represent a milestone in verifiable compute. Through polynomial commitment schemes (such as KZG or FRI), a prover can compress thousands of discrete off-chain state updates into a succint 256-byte cryptographic proof that any verifier can validate in sub-millisecond time.
`
  },
  {
    id: "55555555-5555-4555-a555-555555555555",
    slug: "optimizing-nextjs-turbopack-builds",
    title: "Slashing Monorepo CI/CD Build Times with Turbopack and Multi-Stage Docker",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    author: "writer-101",
    authorName: "Aarav Sharma",
    authorHandle: "@aarav_writes",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    reviewer: "Dr. A. Patil",
    status: "REVISION_DRAFT",
    category: "Web Infrastructure",
    tags: ["nextjs", "turbopack", "devops", "docker"],
    readsCount: 4200,
    readTime: "4 min read",
    rejectionReason: null,
    latestRevisionVersion: 2,
    latestPublishedVersion: 1,
    createdAt: "2024-02-28T14:00:00.000Z",
    modifiedAt: "2024-03-26T11:50:00.000Z",
    excerpt: "Slashing monorepo CI/CD build cycles with Rust-native incremental compilation and multi-stage Docker caching.",
    content: `
### High-Frequency Incremental Bundling

Next.js Turbopack shifts the computation of the dependency graph into Rust-native primitives. By caching function evaluations rather than raw file artifacts, builds scale with the delta of changed code rather than repository volume.
`
  },
  {
    id: "66666666-6666-4666-a666-666666666666",
    slug: "quantum-computing-algorithms-primer",
    title: "A Practical Primer to Grover's Search Algorithm with Qiskit Simulations",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
    author: "writer-101",
    authorName: "Aarav Sharma",
    authorHandle: "@aarav_writes",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    reviewer: "Dr. A. Patil",
    status: "REJECT",
    category: "Emerging Tech",
    tags: ["quantum", "qiskit", "physics", "algorithms"],
    readsCount: 0,
    readTime: "6 min read",
    rejectionReason: "Please expand on noise benchmark methodology and empirical gate fidelity measurements in Section 3 before resubmitting.",
    latestRevisionVersion: 1,
    latestPublishedVersion: 0,
    createdAt: "2024-03-05T09:30:00.000Z",
    modifiedAt: "2024-03-22T13:40:00.000Z",
    excerpt: "Practical amplitude amplification primer with quantum gate fidelity simulations and noise benchmarks in Qiskit.",
    content: `
### Quadratic Speedup Over Classical Search

While Shor's algorithm garners mainstream attention for cryptographic ramifications, Grover's search algorithm demonstrates quantum advantage for unstructured search, achieving O(sqrt(N)) evaluations over classical O(N).
`
  },
  {
    id: "77777777-7777-4777-a777-777777777777",
    slug: "intro-to-web-assembly-compilation",
    title: "Compiling C++ to WebAssembly: Micro-benchmarks Against Native V8 Runtime",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    author: "writer-101",
    authorName: "Aarav Sharma",
    authorHandle: "@aarav_writes",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    reviewer: "Prof. S. Kulkarni",
    status: "ARCHIVED",
    category: "Web Infrastructure",
    tags: ["wasm", "cpp", "v8", "benchmarks"],
    readsCount: 5100,
    readTime: "5 min read",
    rejectionReason: null,
    latestRevisionVersion: 1,
    latestPublishedVersion: 1,
    createdAt: "2023-11-12T10:00:00.000Z",
    modifiedAt: "2024-01-15T15:20:00.000Z",
    excerpt: "Compiling native C++ modules to WebAssembly bytecode with runtime V8 micro-benchmarks and memory limits.",
    content: `
### Near-Native Performance in Sandboxed Runtimes

WebAssembly (Wasm) delivers portable binary bytecode execution at predictable speed. Through Emscripten and LLVM backends, compute-intensive legacy C++ codebases execute within the browser security envelope.
`
  }
];

/**
 * Eight teams sorted by rank.
 */
export const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "Phoenix Systems Lab",
    points: 7210,
    streakDays: 5,
    emblemVariant: "default",
    rank: 1,
  },
  {
    id: "team-2",
    name: "Turing Compilers Group",
    points: 6970,
    streakDays: 4,
    emblemVariant: "default",
    rank: 2,
  },
  {
    id: "team-3",
    name: "Consensus & Protocols Cell",
    points: 6520,
    streakDays: 3,
    emblemVariant: "decorated",
    rank: 3,
  },
  {
    id: "team-4",
    name: "Crypto & Zero-Knowledge Track",
    points: 5875,
    streakDays: 2,
    emblemVariant: "default",
    rank: 4,
  },
  {
    id: "team-5",
    name: "Distributed Telemetry Guild",
    points: 5800,
    streakDays: 1,
    emblemVariant: "default",
    rank: 5,
  },
  {
    id: "team-6",
    name: "Linux Kernel Hacking Unit",
    points: 5535,
    streakDays: 0,
    emblemVariant: "default",
    rank: 6,
  },
  {
    id: "team-7",
    name: "Microservices Architecture Pod",
    points: 5410,
    streakDays: 0,
    emblemVariant: "default",
    rank: 7,
  },
  {
    id: "team-8",
    name: "Wasm & Runtime Mechanics",
    points: 5180,
    streakDays: 0,
    emblemVariant: "default",
    rank: 8,
  },
];
