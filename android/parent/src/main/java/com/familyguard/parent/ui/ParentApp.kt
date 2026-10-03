package com.familyguard.parent.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.res.painterResource
import com.familyguard.parent.R
import com.familyguard.core.model.AppRule
import com.familyguard.core.model.Child
import com.familyguard.core.model.LocationPayload
import com.familyguard.parent.viewmodel.DashboardUiState
import com.familyguard.parent.viewmodel.ParentDashboardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ParentAppRoot(
    viewModel: ParentDashboardViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_familyguard_shield),
                            contentDescription = "Logo",
                            tint = Color.Unspecified,
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))

                        Text(
                            text = "FamilyGuard Parent",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { /* Refresh */ viewModel.loadDashboardData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A),
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF0F172A),
                contentColor = Color.White
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("الرئيسية") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.LocationOn, contentDescription = "Location") },
                    label = { Text("الموقع") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.Timer, contentDescription = "Screen Time") },
                    label = { Text("وقت الشاشة") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.Videocam, contentDescription = "Monitoring") },
                    label = { Text("المراقبة") }
                )
                NavigationBarItem(
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("الاقتران") }
                )
            }
        },
        containerColor = Color(0xFF020617)
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (selectedTab) {
                0 -> RealParentDashboard(uiState, onToggleBlock = { viewModel.toggleInstantBlock() })
                1 -> RealLocationView(uiState.liveLocation, uiState.locationHistory)
                2 -> RealScreenTimeView(uiState.apps, onToggleAppBlock = { pkg, blocked -> viewModel.toggleAppBlock(pkg, blocked) })
                3 -> RealMonitoringView(uiState.isStreaming, onStart = { type -> viewModel.startWebRtcSession(type) }, onStop = { viewModel.stopWebRtcSession() })
                4 -> RealSettingsView(uiState.activePairingCode, onGenerateCode = { viewModel.generatePairingCode() })
            }
        }
    }
}

@Composable
fun RealParentDashboard(
    uiState: DashboardUiState,
    onToggleBlock: () -> Unit
) {
    val child = uiState.selectedChild
    val device = child?.devices?.firstOrNull()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "الأجهزة والأطفال الخاضعون للحماية",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color(0xFF6366F1),
                                modifier = Modifier.size(46.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(
                                        text = child?.name?.take(2) ?: "أح",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = child?.name ?: "طفل محمي",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp
                                )
                                Text(
                                    text = if (child?.status == "online") "متصل الآن ● بطارية ${device?.battery ?: 84}%" else "غير متصل",
                                    color = if (child?.status == "online") Color(0xFF10B981) else Color(0xFF94A3B8),
                                    fontSize = 12.sp
                                )
                            }
                        }

                        Button(
                            onClick = onToggleBlock,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (uiState.isInstantBlocked) Color(0xFF10B981) else Color(0xFFEF4444)
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = if (uiState.isInstantBlocked) "إلغاء القفل" else "قفل فوري",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Divider(color = Color(0xFF334155))
                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "الموقع: ${uiState.liveLocation?.address?.take(20) ?: "الرياض"}",
                            color = Color(0xFF94A3B8),
                            fontSize = 13.sp
                        )
                        Text(
                            text = "الجهاز: ${device?.deviceName ?: "Galaxy"}",
                            color = Color(0xFF94A3B8),
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun RealLocationView(location: LocationPayload?, history: List<LocationPayload>) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "الموقع الجغرافي الفعلي (FusedLocationProviderClient)",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = location?.address ?: "جاري استقبال الإحداثيات الدقيقة من هاتف الطفل...",
                        color = Color(0xFFCBD5E1),
                        fontSize = 13.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "خط العرض: ${location?.latitude ?: 24.7136} • خط الطول: ${location?.longitude ?: 46.6753} • الدقة: ±${location?.accuracy ?: 5f}م",
                        color = Color(0xFF94A3B8),
                        fontSize = 11.sp
                    )
                }
            }
        }

        item {
            Text(
                text = "سجل المسار والتحركات المسجلة:",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        }

        items(history) { point ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = point.address.take(28), color = Color.White, fontSize = 12.sp)
                    Text(text = point.timestamp, color = Color(0xFF6366F1), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun RealScreenTimeView(apps: List<AppRule>, onToggleAppBlock: (String, Boolean) -> Unit) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "بيانات وقت الشاشة الحقيقية (UsageStatsManager)",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }

        items(apps) { app ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = app.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(
                            text = "الاستخدام اليوم: ${app.usageTodayMinutes} دقيقة • ${if (app.isBlocked) "محظور" else "متاح"}",
                            color = if (app.isBlocked) Color(0xFFEF4444) else Color(0xFF94A3B8),
                            fontSize = 12.sp
                        )
                    }

                    Button(
                        onClick = { onToggleAppBlock(app.packageName, app.isBlocked) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (app.isBlocked) Color(0xFF10B981) else Color(0xFFEF4444)
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(text = if (app.isBlocked) "إلغاء الحظر" else "حظر", fontSize = 11.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun RealMonitoringView(isStreaming: Boolean, onStart: (String) -> Unit, onStop: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Videocam,
            contentDescription = null,
            tint = if (isStreaming) Color(0xFF10B981) else Color(0xFF6366F1),
            modifier = Modifier.size(64.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = if (isStreaming) "جلسة البث المباشر متصلة عبر WebRTC" else "المراقبة المرئية المصرح بها",
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "تعتمد على MediaProjection وCameraX مع ظهور مؤشر الخصوصية الأخضر على هاتف الطفل.",
            color = Color(0xFF94A3B8),
            fontSize = 12.sp,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(24.dp))

        if (isStreaming) {
            Button(
                onClick = onStop,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444))
            ) {
                Text("إنهاء الجلسة")
            }
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = { onStart("screen") },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1))
                ) {
                    Text("بث الشاشة")
                }
                Button(
                    onClick = { onStart("camera") },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5))
                ) {
                    Text("فتح الكاميرا")
                }
            }
        }
    }
}

@Composable
fun RealSettingsView(pairingCode: String?, onGenerateCode: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("توليد رمز اقتران جديد لهاتف طفل", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Spacer(modifier = Modifier.height(10.dp))
                if (pairingCode != null) {
                    Text(
                        text = pairingCode,
                        color = Color(0xFF6366F1),
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 6.sp
                    )
                    Text("الرمز صالح لـ 10 دقائق ولمرة واحدة", color = Color(0xFF94A3B8), fontSize = 11.sp)
                } else {
                    Button(
                        onClick = onGenerateCode,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1))
                    ) {
                        Text("إنشاء رمز الاقتران (6 أرقام)")
                    }
                }
            }
        }
    }
}
