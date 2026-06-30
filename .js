local HttpService = game:GetService("HttpService")

local gameName = tostring(game:GetService("MarketplaceService"):GetProductInfo(game.PlaceId).Name)
gameName = gameName:gsub("[^%w_ ]", "")
gameName = gameName:gsub("%s+", "_")

local ConfigRoot = "WisHUB_UI_Settings"
local ConfigFolder = ConfigRoot .. "/Configs"
local GameConfigFolder = ConfigFolder .. "/" .. gameName
local AutoLoadFile = GameConfigFolder .. "/_autoload.json"

ConfigData = {}
Elements = {}
CURRENT_VERSION = nil

-- ============================================
-- PERFORMANCE: Pre-cached values
-- ============================================

local CACHE = {
    Colors = {
        White = Color3.fromRGB(255, 255, 255),
        Black = Color3.fromRGB(0, 0, 0),
        Gray230 = Color3.fromRGB(230, 230, 230),
        Gray150 = Color3.fromRGB(150, 150, 150),
        Gray180 = Color3.fromRGB(180, 180, 180),
        Gray200 = Color3.fromRGB(200, 200, 200),
        Gray20 = Color3.fromRGB(20, 20, 20),
        Gray80 = Color3.fromRGB(80, 80, 80),
        Cyan = Color3.fromRGB(0, 208, 255),
        Red255 = Color3.fromRGB(255, 90, 90),
        Orange255 = Color3.fromRGB(255, 170, 0),
    },
    TweenInfo = {
        Fast = TweenInfo.new(0.1),
        Normal = TweenInfo.new(0.2),
        Slow = TweenInfo.new(0.3),
        Smooth = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut),
        Back = TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.InOut),
        BackSlow = TweenInfo.new(0.6, Enum.EasingStyle.Back, Enum.EasingDirection.InOut),
        Quad = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut),
        CircleFast = TweenInfo.new(0.2, Enum.EasingStyle.Back, Enum.EasingDirection.InOut),
    },
    Transparency = {
        Invisible = 0.999,
        NearInvisible = 0.935,
        SemiInvisible = 0.85,
    },
    UDim = {
        Corner4 = UDim.new(0, 4),
        Corner6 = UDim.new(0, 6),
        Corner8 = UDim.new(0, 8),
        Corner10 = UDim.new(0, 10),
        Corner15 = UDim.new(0, 15),
    }
}

-- ============================================
-- Utility Functions
-- ============================================

local function EnsureFolder(path)
    if isfolder and makefolder and not isfolder(path) then
        makefolder(path)
    end
end

local function EnsureConfigFolder()
    EnsureFolder(ConfigRoot)
    EnsureFolder(ConfigFolder)
    EnsureFolder(GameConfigFolder)
end

local function CleanFileName(name)
    name = tostring(name or "")
    name = name:gsub("^%s+", ""):gsub("%s+$", "")
    name = name:gsub("[^%w_%- ]", "_")
    name = name:gsub("%s+", "_")
    return name
end

local function GetConfigPath(name)
    return GameConfigFolder .. "/" .. CleanFileName(name) .. ".json"
end

local function ShouldUseConfig(cfg)
    return cfg.NoConfig ~= true and cfg.Config ~= false
end

function SaveConfig(path)
    if path and writefile then
        EnsureConfigFolder()
        ConfigData._version = CURRENT_VERSION
        local ok = pcall(function()
            writefile(path, HttpService:JSONEncode(ConfigData))
        end)
        return ok
    end
    return false
end

function LoadConfigFromFile()
    if not CURRENT_VERSION then return end
    ConfigData = { _version = CURRENT_VERSION }
end

function LoadConfigElements()
    for key, element in pairs(Elements) do
        if ConfigData[key] ~= nil and element.Set then
            element:Set(ConfigData[key], true)
        end
    end
end

local Icons = {
    player    = "rbxassetid://12120698352",
    web       = "rbxassetid://137601480983962",
    bag       = "rbxassetid://8601111810",
    shop      = "rbxassetid://4985385964",
    cart      = "rbxassetid://128874923961846",
    plug      = "rbxassetid://137601480983962",
    settings  = "rbxassetid://70386228443175",
    loop      = "rbxassetid://122032243989747",
    gps       = "rbxassetid://17824309485",
    compas    = "rbxassetid://125300760963399",
    gamepad   = "rbxassetid://84173963561612",
    boss      = "rbxassetid://13132186360",
    scroll    = "rbxassetid://114127804740858",
    menu      = "rbxassetid://6340513838",
    crosshair = "rbxassetid://12614416478",
    user      = "rbxassetid://108483430622128",
    stat      = "rbxassetid://12094445329",
    eyes      = "rbxassetid://14321059114",
    sword     = "rbxassetid://82472368671405",
    discord   = "rbxassetid://94434236999817",
    star      = "rbxassetid://107005941750079",
    skeleton  = "rbxassetid://17313330026",
    payment   = "rbxassetid://18747025078",
    scan      = "rbxassetid://109869955247116",
    alert     = "rbxassetid://73186275216515",
    question  = "rbxassetid://17510196486",
    idea      = "rbxassetid://16833255748",
    strom     = "rbxassetid://13321880293",
    water     = "rbxassetid://100076212630732",
    dcs       = "rbxassetid://15310731934",
    start     = "rbxassetid://108886429866687",
    next      = "rbxassetid://12662718374",
    rod       = "rbxassetid://103247953194129",
    fish      = "rbxassetid://97167558235554",
}

local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local TextService = game:GetService("TextService")
local RunService = game:GetService("RunService")
local LocalPlayer = game:GetService("Players").LocalPlayer
local Mouse = LocalPlayer:GetMouse()
local CoreGui = game:GetService("CoreGui")
local viewport = workspace.CurrentCamera.ViewportSize

local WISHUB_GUI_NAME = "NatUI"
local WISHUB_TOGGLE_GUI_NAME = "ToggleUIButton"
local WISHUB_NOTIFY_GUI_NAME = "NotifyGui"
local WISHUB_LOCK_KEY = "__WishHubActive"
local WISHUB_SECURITY_KEY = "__WishHubSecurity"
local WISHUB_KICK_MESSAGE = "WisHUB Security Alert"
local WISHUB_OWNED_ATTRIBUTE = "WisHubOwned"
local WISHUB_ALLOWED_SCREEN_GUI_NAMES = {
    [WISHUB_GUI_NAME] = true,
    [WISHUB_TOGGLE_GUI_NAME] = true,
    [WISHUB_NOTIFY_GUI_NAME] = true,
    WisHubFruitEsp = true,
    WisHubGardenValueGui = true,
    WisHubHarvestInventoryValue = true,
    WisHubPetFinderGui = true,
    WisHubRevealEventGui = true,
}

-- ============================================
-- Helper Functions (Performance Optimized)
-- ============================================

local function GetExecutorEnvironment()
    if getgenv then
        local ok, env = pcall(getgenv)
        if ok and type(env) == "table" then
            return env
        end
    end
    return _G
end

local function KickWishHubLocked(reason)
    local env = GetExecutorEnvironment()
    env.__WishHubLastKickReason = tostring(reason or "Unknown")
    warn("[WisHUB Protection] Kick:", env.__WishHubLastKickReason)
    pcall(function()
        if LocalPlayer then
            LocalPlayer:Kick(WISHUB_KICK_MESSAGE)
        end
    end)
end

local function MakeBlockedTabs()
    local noop = function() end
    local paragraph = {
        Instances = {},
        Set = noop,
        SetTitle = noop,
        SetContent = noop,
        Destroy = noop,
    }
    local items = {}
    function items:AddParagraph() return paragraph end
    function items:AddPanel() return { Set = noop, GetInput = function() return "" end, Instances = {} } end
    function items:AddButton() return nil end
    function items:AddToggle() return { Set = noop, Value = false, Instances = {} } end
    function items:AddSlider() return { Set = noop, Value = 0, Instances = {} } end
    function items:AddInput() return { Set = noop, Value = "", Instances = {} } end
    function items:AddDropdown() return { Set = noop, AddOption = noop, RemoveOption = noop, Refresh = noop, Value = nil, Instances = {} } end
    function items:AddConfig() return { Refresh = noop } end
    function items:AddBanner() return nil end
    function items:AddCard() return nil end
    function items:AddDivider() return nil end
    function items:AddSubSection() return nil end

    local sections = {}
    function sections:AddSection() return items end

    local tabs = {
        Window = {
            DestroyGui = noop,
            ToggleUI = noop,
            ExportConfig = function() return "" end,
            ImportConfig = function() return false end,
        },
    }
    function tabs:AddTab() return sections end
    function tabs:InfoTab() return sections, items end
    tabs.ExportConfig = function() return "" end
    tabs.ImportConfig = function() return false end
    return tabs
end

local function FindUnsafeEnvironmentMarker()
    return nil
end

local function IsForeignUiCandidate(child, strictUiLock)
    if not child or not child:IsA("ScreenGui") then
        return false
    end

    if strictUiLock then
        return true
    end

    local name = string.lower(tostring(child.Name or ""))
    name = name:gsub("[%s_%-%[%]%.]", "")

    local blockedNames = {
        "simplespy", "remotespy", "httpspy", "httplogger", "hydroxide", "darkdex",
        "requestspy", "requestlogger", "hookspy", "cobalt", "remotelogger",
        "remoteeventspy", "remotefunctionspy", "remoteeventlogger", "remotefunctionlogger",
        "cobaltremotespy", "speedhub", "speedhubx",
    }

    for _, blockedName in ipairs(blockedNames) do
        if string.find(name, blockedName, 1, true) then
            return true
        end
    end

    local scanned = 0
    for _, descendant in ipairs(child:GetDescendants()) do
        scanned = scanned + 1
        if scanned > 1500 then
            break
        end

        local descendantName = string.lower(tostring(descendant.Name or ""))
        descendantName = descendantName:gsub("[%s_%-%[%]%.]", "")
        for _, blockedName in ipairs(blockedNames) do
            if string.find(descendantName, blockedName, 1, true) then
                return true
            end
        end

        if descendant:IsA("TextLabel") or descendant:IsA("TextButton") or descendant:IsA("TextBox") then
            local text = string.lower(tostring(descendant.Text or ""))
            text = text:gsub("[%s_%-%[%]%.:/|]", "")
            for _, blockedName in ipairs(blockedNames) do
                if string.find(text, blockedName, 1, true) then
                    return true
                end
            end
        end
    end

    return false
end

local function ReleaseWishHubProtection()
    local env = GetExecutorEnvironment()
    local security = env[WISHUB_SECURITY_KEY]
    if type(security) == "table" then
        for _, connection in pairs(security.Connections or {}) do
            pcall(function()
                connection:Disconnect()
            end)
        end
    end
    env[WISHUB_SECURITY_KEY] = nil
    env[WISHUB_LOCK_KEY] = nil
end

local function AllowWishHubInstance(instance)
    if not instance then return end
    pcall(function()
        instance:SetAttribute(WISHUB_OWNED_ATTRIBUTE, true)
    end)
    local security = GetExecutorEnvironment()[WISHUB_SECURITY_KEY]
    if type(security) == "table" then
        security.AllowedInstances = security.AllowedInstances or {}
        security.AllowedInstances[instance] = true
    end
end

local function IsWishHubAllowedInstance(instance, security)
    if not instance then return false end
    if instance.Name == "RobloxGui" then return true end
    if WISHUB_ALLOWED_SCREEN_GUI_NAMES[instance.Name] then return true end

    local ok, owned = pcall(function()
        return instance:GetAttribute(WISHUB_OWNED_ATTRIBUTE)
    end)
    if ok and owned == true then return true end

    if type(security) == "table" and type(security.AllowedInstances) == "table" then
        if security.AllowedInstances[instance] then return true end
    end

    return false
end

local function ScanCoreGuiForForeignUi(strictUiLock)
    local security = GetExecutorEnvironment()[WISHUB_SECURITY_KEY]
    for _, child in ipairs(CoreGui:GetChildren()) do
        if child:IsA("ScreenGui") and not IsWishHubAllowedInstance(child, security) then
            if IsForeignUiCandidate(child, strictUiLock) then
                return child
            end
        end
    end
end

local function StartWishHubProtection(guiConfig)
    local env = GetExecutorEnvironment()
    local strictUiLock = guiConfig and guiConfig.StrictUILock == true
    if env[WISHUB_LOCK_KEY] or CoreGui:FindFirstChild(WISHUB_GUI_NAME) or CoreGui:FindFirstChild(WISHUB_TOGGLE_GUI_NAME) then
        ReleaseWishHubProtection()
        for _, guiName in ipairs({ WISHUB_GUI_NAME, WISHUB_TOGGLE_GUI_NAME, WISHUB_NOTIFY_GUI_NAME }) do
            local oldGui = CoreGui:FindFirstChild(guiName)
            if oldGui then
                pcall(function()
                    oldGui:Destroy()
                end)
            end
        end
        task.wait()
    end

    local unsafeMarker = FindUnsafeEnvironmentMarker()
    if unsafeMarker then
        KickWishHubLocked("Environment marker: " .. tostring(unsafeMarker))
        return false
    end

    local baseline = {}
    for _, child in ipairs(CoreGui:GetChildren()) do
        baseline[child] = true
    end

    env[WISHUB_LOCK_KEY] = {
        Active = true,
        PlaceId = game.PlaceId,
        Title = guiConfig and guiConfig.Title or "WisHub",
        StartedAt = os.clock(),
    }

    local connections = {}
    local security = { Connections = connections, AllowedInstances = {} }
    env[WISHUB_SECURITY_KEY] = security

    local existingForeignUi = ScanCoreGuiForForeignUi(strictUiLock)
    if existingForeignUi then
        KickWishHubLocked("Existing CoreGui: " .. tostring(existingForeignUi:GetFullName()))
        ReleaseWishHubProtection()
        return false
    end

    connections[#connections + 1] = CoreGui.ChildAdded:Connect(function(child)
        task.defer(function()
            for _ = 1, 6 do
                local activeSecurity = env[WISHUB_SECURITY_KEY]
                if not child or not child.Parent or baseline[child] or IsWishHubAllowedInstance(child, activeSecurity) then
                    return
                end
                if IsForeignUiCandidate(child, strictUiLock) then
                    KickWishHubLocked("CoreGui added: " .. tostring(child:GetFullName()))
                    return
                end
                task.wait(0.25)
            end
        end)
    end)

    task.spawn(function()
        while env[WISHUB_LOCK_KEY] do
            local loopMarker = FindUnsafeEnvironmentMarker()
            if loopMarker then
                KickWishHubLocked("Environment marker loop: " .. tostring(loopMarker))
                break
            end
            local foreignUi = ScanCoreGuiForForeignUi(strictUiLock)
            if foreignUi then
                KickWishHubLocked("CoreGui scan loop: " .. tostring(foreignUi:GetFullName()))
                break
            end
            task.wait(0.5)
        end
    end)

    return true
end

local function isMobileDevice()
    return UserInputService.TouchEnabled
        and not UserInputService.KeyboardEnabled
        and not UserInputService.MouseEnabled
end

local isMobile = isMobileDevice()

local function safeSize(pxWidth, pxHeight)
    local scaleX = pxWidth / viewport.X
    local scaleY = pxHeight / viewport.Y

    if isMobile then
        if scaleX > 0.5 then scaleX = 0.5 end
        if scaleY > 0.3 then scaleY = 0.3 end
    end

    return UDim2.new(scaleX, 0, scaleY, 0)
end

-- ============================================
-- PERFORMANCE: Optimized Draggable
-- ============================================

local function MakeDraggable(topbarobject, object)
    local connections = {}
    local Dragging = false
    local DragInput, DragStart, StartPosition

    local function UpdatePos(input)
        local Delta = input.Position - DragStart
        local pos = UDim2.new(
            StartPosition.X.Scale,
            StartPosition.X.Offset + Delta.X,
            StartPosition.Y.Scale,
            StartPosition.Y.Offset + Delta.Y
        )
        -- PERFORMANCE: Reuse cached TweenInfo
        local Tween = TweenService:Create(object, CACHE.TweenInfo.Smooth, { Position = pos })
        Tween:Play()
    end

    connections[#connections + 1] = topbarobject.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            Dragging = true
            DragStart = input.Position
            StartPosition = object.Position
        end
    end)

    connections[#connections + 1] = topbarobject.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            Dragging = false
        end
    end)

    connections[#connections + 1] = topbarobject.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
            DragInput = input
        end
    end)

    connections[#connections + 1] = UserInputService.InputChanged:Connect(function(input)
        if input == DragInput and Dragging then
            UpdatePos(input)
        end
    end)

    return connections
end

-- ============================================
-- PERFORMANCE: Optimized CircleClick
-- ============================================

function CircleClick(Button, X, Y)
    task.spawn(function()
        Button.ClipsDescendants = true

        local Circle = Instance.new("ImageLabel")
        Circle.Image = "rbxassetid://266543268"
        Circle.ImageColor3 = CACHE.Colors.Gray80
        Circle.ImageTransparency = 0.9
        Circle.BackgroundTransparency = 1
        Circle.ZIndex = 10
        Circle.Name = "Circle"
        Circle.Parent = Button

        local NewX = X - Button.AbsolutePosition.X
        local NewY = Y - Button.AbsolutePosition.Y
        Circle.Position = UDim2.new(0, NewX, 0, NewY)

        -- PERFORMANCE: Calculate size once
        local size = math.max(Button.AbsoluteSize.X, Button.AbsoluteSize.Y) * 1.5

        -- PERFORMANCE: Use cached TweenInfo
        local tweenInfo = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
        local Tween = TweenService:Create(Circle, tweenInfo, {
            Size = UDim2.new(0, size, 0, size),
            Position = UDim2.new(0.5, -size/2, 0.5, -size/2)
        })
        Tween:Play()

        -- PERFORMANCE: Use Tween.Completed instead of wait loop
        Tween.Completed:Connect(function()
            Circle:Destroy()
        end)
    end)
end

local Chloex = {}

-- ============================================
-- PERFORMANCE: Optimized Notify
-- ============================================

function Chloex:MakeNotify(NotifyConfig)
    NotifyConfig = NotifyConfig or {}
    NotifyConfig.Title = NotifyConfig.Title or "WisHub"
    NotifyConfig.Description = NotifyConfig.Description or "Notification"
    NotifyConfig.Content = NotifyConfig.Content or "Content"
    NotifyConfig.Color = NotifyConfig.Color or CACHE.Colors.Cyan
    NotifyConfig.Time = NotifyConfig.Time or 0.5
    NotifyConfig.Delay = NotifyConfig.Delay or 5

    local NotifyFunction = {}
    local NotifyGui = CoreGui:FindFirstChild(WISHUB_NOTIFY_GUI_NAME)

    task.spawn(function()
        if not NotifyGui then
            NotifyGui = Instance.new("ScreenGui")
            NotifyGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
            NotifyGui.Name = WISHUB_NOTIFY_GUI_NAME
            AllowWishHubInstance(NotifyGui)
            NotifyGui.Parent = CoreGui
        end

        local NotifyLayout = NotifyGui:FindFirstChild("NotifyLayout")
        if not NotifyLayout then
            NotifyLayout = Instance.new("Frame")
            NotifyLayout.AnchorPoint = Vector2.new(1, 1)
            NotifyLayout.BackgroundTransparency = 1
            NotifyLayout.BorderSizePixel = 0
            NotifyLayout.Position = UDim2.new(1, -30, 1, -30)
            NotifyLayout.Size = UDim2.new(0, 320, 1, 0)
            NotifyLayout.Name = "NotifyLayout"
            NotifyLayout.Parent = NotifyGui

            -- PERFORMANCE: Count once, update positions
            local Count = 0
            NotifyLayout.ChildRemoved:Connect(function()
                Count = 0
                local tweenInfo = CACHE.TweenInfo.Smooth
                for _, v in NotifyGui.NotifyLayout:GetChildren() do
                    TweenService:Create(v, tweenInfo, {
                        Position = UDim2.new(0, 0, 1, -((v.Size.Y.Offset + 12) * Count))
                    }):Play()
                    Count = Count + 1
                end
            end)
        end

        local NotifyPosHeigh = 0
        for _, v in NotifyLayout:GetChildren() do
            NotifyPosHeigh = -(v.Position.Y.Offset) + v.Size.Y.Offset + 12
        end

        -- PERFORMANCE: Consolidated instance creation
        local NotifyFrame = Instance.new("Frame")
        NotifyFrame.BackgroundTransparency = 1
        NotifyFrame.Size = UDim2.new(1, 0, 0, 150)
        NotifyFrame.Name = "NotifyFrame"
        NotifyFrame.AnchorPoint = Vector2.new(0, 1)
        NotifyFrame.Position = UDim2.new(0, 0, 1, -(NotifyPosHeigh))
        NotifyFrame.Parent = NotifyLayout

        local NotifyFrameReal = Instance.new("Frame")
        NotifyFrameReal.BackgroundColor3 = CACHE.Colors.Black
        NotifyFrameReal.BorderSizePixel = 0
        NotifyFrameReal.Position = UDim2.new(0, 400, 0, 0)
        NotifyFrameReal.Size = UDim2.new(1, 0, 1, 0)
        NotifyFrameReal.Name = "NotifyFrameReal"
        NotifyFrameReal.Parent = NotifyFrame

        local Corner1 = Instance.new("UICorner")
        Corner1.CornerRadius = UDim.new(0, 8)
        Corner1.Parent = NotifyFrameReal

        -- DropShadow
        local DropShadowHolder = Instance.new("Frame")
        DropShadowHolder.BackgroundTransparency = 1
        DropShadowHolder.Size = UDim2.new(1, 0, 1, 0)
        DropShadowHolder.ZIndex = 0
        DropShadowHolder.Name = "DropShadowHolder"
        DropShadowHolder.Parent = NotifyFrameReal

        local DropShadow = Instance.new("ImageLabel")
        DropShadow.Image = "rbxassetid://6015897843"
        DropShadow.ImageColor3 = CACHE.Colors.Black
        DropShadow.ImageTransparency = 0.5
        DropShadow.ScaleType = Enum.ScaleType.Slice
        DropShadow.SliceCenter = Rect.new(49, 49, 450, 450)
        DropShadow.AnchorPoint = Vector2.new(0.5, 0.5)
        DropShadow.BackgroundTransparency = 1
        DropShadow.Size = UDim2.new(1, 47, 1, 47)
        DropShadow.ZIndex = 0
        DropShadow.Name = "DropShadow"
        DropShadow.Parent = DropShadowHolder

        -- Top
        local Top = Instance.new("Frame")
        Top.BackgroundTransparency = 1
        Top.Size = UDim2.new(1, 0, 0, 36)
        Top.Name = "Top"
        Top.Parent = NotifyFrameReal

        local TitleLabel = Instance.new("TextLabel")
        TitleLabel.Font = Enum.Font.GothamBold
        TitleLabel.Text = NotifyConfig.Title
        TitleLabel.TextColor3 = CACHE.Colors.White
        TitleLabel.TextSize = 14
        TitleLabel.TextXAlignment = Enum.TextXAlignment.Left
        TitleLabel.BackgroundTransparency = 1
        TitleLabel.Size = UDim2.new(1, 0, 1, 0)
        TitleLabel.Position = UDim2.new(0, 10, 0, 0)
        TitleLabel.Parent = Top

        local DescLabel = Instance.new("TextLabel")
        DescLabel.Font = Enum.Font.GothamBold
        DescLabel.Text = NotifyConfig.Description
        DescLabel.TextColor3 = NotifyConfig.Color
        DescLabel.TextSize = 14
        DescLabel.TextXAlignment = Enum.TextXAlignment.Left
        DescLabel.BackgroundTransparency = 1
        DescLabel.Position = UDim2.new(0, TitleLabel.TextBounds.X + 15, 0, 0)
        DescLabel.Size = UDim2.new(1, 0, 1, 0)
        DescLabel.Parent = Top

        local CloseBtn = Instance.new("TextButton")
        CloseBtn.BackgroundTransparency = 1
        CloseBtn.AnchorPoint = Vector2.new(1, 0.5)
        CloseBtn.Position = UDim2.new(1, -5, 0.5, 0)
        CloseBtn.Size = UDim2.new(0, 25, 0, 25)
        CloseBtn.Name = "Close"
        CloseBtn.Parent = Top

        local CloseImg = Instance.new("ImageLabel")
        CloseImg.Image = "rbxassetid://9886659671"
        CloseImg.AnchorPoint = Vector2.new(0.5, 0.5)
        CloseImg.BackgroundTransparency = 1
        CloseImg.Position = UDim2.new(0.49, 0, 0.5, 0)
        CloseImg.Size = UDim2.new(1, -8, 1, -8)
        CloseImg.Parent = CloseBtn

        local ContentLabel = Instance.new("TextLabel")
        ContentLabel.Font = Enum.Font.GothamBold
        ContentLabel.TextColor3 = CACHE.Colors.Gray150
        ContentLabel.TextSize = 13
        ContentLabel.Text = NotifyConfig.Content
        ContentLabel.TextXAlignment = Enum.TextXAlignment.Left
        ContentLabel.TextYAlignment = Enum.TextYAlignment.Top
        ContentLabel.BackgroundTransparency = 1
        ContentLabel.Position = UDim2.new(0, 10, 0, 27)
        ContentLabel.TextWrapped = true
        ContentLabel.Parent = NotifyFrameReal

        ContentLabel.Size = UDim2.new(1, -20, 0, 13 + (13 * (ContentLabel.TextBounds.X // ContentLabel.AbsoluteSize.X)))

        if ContentLabel.AbsoluteSize.Y < 27 then
            NotifyFrame.Size = UDim2.new(1, 0, 0, 65)
        else
            NotifyFrame.Size = UDim2.new(1, 0, 0, ContentLabel.AbsoluteSize.Y + 40)
        end

        local waitbruh = false
        function NotifyFunction:Close()
            if waitbruh then return false end
            waitbruh = true

            local tweenInfo = TweenInfo.new(tonumber(NotifyConfig.Time), Enum.EasingStyle.Back, Enum.EasingDirection.InOut)
            TweenService:Create(NotifyFrameReal, tweenInfo, { Position = UDim2.new(0, 400, 0, 0) }):Play()
            task.wait(tonumber(NotifyConfig.Time) / 1.2)
            NotifyFrame:Destroy()
        end

        CloseBtn.Activated:Connect(function()
            NotifyFunction:Close()
        end)

        local tweenInfoIn = TweenInfo.new(tonumber(NotifyConfig.Time), Enum.EasingStyle.Back, Enum.EasingDirection.InOut)
        TweenService:Create(NotifyFrameReal, tweenInfoIn, { Position = UDim2.new(0, 0, 0, 0) }):Play()
        task.wait(tonumber(NotifyConfig.Delay))
        NotifyFunction:Close()
    end)

    return NotifyFunction
end

function than(msg, delay, color, title, desc)
    return Chloex:MakeNotify({
        Title = title or "WisHub",
        Description = desc or "Notification",
        Content = msg or "Content",
        Color = color or CACHE.Colors.Cyan,
        Delay = delay or 4
    })
end

-- ============================================
-- Main Window Creation
-- ============================================

function Chloex:Window(GuiConfig)
    GuiConfig = GuiConfig or {}
    GuiConfig.Title = GuiConfig.Title or "WisHub"
    GuiConfig.Footer = GuiConfig.Footer or ""
    GuiConfig.Color = GuiConfig.Color or Color3.fromRGB(255, 0, 255)
    GuiConfig["Tab Width"] = GuiConfig["Tab Width"] or 120
    GuiConfig.Version = GuiConfig.Version or 1
    if GuiConfig.Search == nil then GuiConfig.Search = true end
    if GuiConfig.Protection == nil then GuiConfig.Protection = true end
    if GuiConfig.StrictUILock == nil then GuiConfig.StrictUILock = false end

    if GuiConfig.Protection and not StartWishHubProtection(GuiConfig) then
        return MakeBlockedTabs()
    end

    CURRENT_VERSION = GuiConfig.Version
    LoadConfigFromFile()

    local GuiFunc = {}
    local SearchRegistry = {}
    local TabRegistry = {}
    local allConnections = {} -- PERFORMANCE: Track all connections for cleanup

    -- PERFORMANCE: Cached color reference
    local ConfigColor = GuiConfig.Color

    local function SmartMatch(query, target)
        if query == "" then return 0 end
        local q, t = string.lower(query), string.lower(target)
        if q == t then return 1000 end
        if string.sub(t, 1, #q) == q then return 800 end
        local idx = string.find(t, q, 1, true)
        if idx then return 600 - idx end
        local qi, ti, lastIdx = 1, 1, 0
        while qi <= #q and ti <= #t do
            if string.sub(q, qi, qi) == string.sub(t, ti, ti) then
                lastIdx = ti
                qi = qi + 1
            end
            ti = ti + 1
        end
        if qi > #q then
            return 200 - (lastIdx - #q) * 2
        end
        return 0
    end

    local function RegisterSearch(entry)
        SearchRegistry[#SearchRegistry + 1] = entry
    end

    -- ============================================
    -- Window GUI Creation
    -- ============================================

    local NatUI = Instance.new("ScreenGui")
    NatUI.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    NatUI.Name = WISHUB_GUI_NAME
    NatUI.ResetOnSpawn = false
    AllowWishHubInstance(NatUI)
    NatUI.Parent = CoreGui

    local DropShadowHolder = Instance.new("Frame")
    DropShadowHolder.BackgroundTransparency = 1
    DropShadowHolder.AnchorPoint = Vector2.new(0.5, 0.5)
    DropShadowHolder.Position = UDim2.new(0.5, 0, 0.5, 0)
    DropShadowHolder.Size = isMobile and safeSize(470, 270) or safeSize(640, 400)
    DropShadowHolder.ZIndex = 0
    DropShadowHolder.Name = "DropShadowHolder"
    DropShadowHolder.Parent = NatUI

    DropShadowHolder.Position = UDim2.new(0, (NatUI.AbsoluteSize.X // 2 - 230), 0, (NatUI.AbsoluteSize.Y // 2 - 175))

    local DropShadow = Instance.new("ImageLabel")
    DropShadow.Image = "rbxassetid://6015897843"
    DropShadow.ImageColor3 = Color3.fromRGB(15, 15, 15)
    DropShadow.ImageTransparency = 1
    DropShadow.ScaleType = Enum.ScaleType.Slice
    DropShadow.SliceCenter = Rect.new(49, 49, 450, 450)
    DropShadow.AnchorPoint = Vector2.new(0.5, 0.5)
    DropShadow.BackgroundTransparency = 1
    DropShadow.Position = UDim2.new(0.5, 0, 0.5, 0)
    DropShadow.Size = UDim2.new(1, 47, 1, 47)
    DropShadow.ZIndex = 0
    DropShadow.Name = "DropShadow"
    DropShadow.Parent = DropShadowHolder

    local Main
    if GuiConfig.Theme then
        Main = Instance.new("ImageLabel")
        Main.Image = "rbxassetid://" .. GuiConfig.Theme
        Main.ScaleType = Enum.ScaleType.Crop
        Main.BackgroundTransparency = 1
        Main.ImageTransparency = GuiConfig.ThemeTransparency or 0.15
    else
        Main = Instance.new("Frame")
        Main.BackgroundColor3 = CACHE.Colors.Black
    end

    Main.AnchorPoint = Vector2.new(0.5, 0.5)
    Main.BorderSizePixel = 0
    Main.Position = UDim2.new(0.5, 0, 0.5, 0)
    Main.Size = UDim2.new(1, -47, 1, -47)
    Main.Name = "Main"
    Main.Parent = DropShadow

    local MainCorner = Instance.new("UICorner")
    MainCorner.Parent = Main

    -- Top Bar
    local Top = Instance.new("Frame")
    Top.BackgroundTransparency = 1
    Top.Size = UDim2.new(1, 0, 0, 38)
    Top.Name = "Top"
    Top.Parent = Main

    local TitleLabel = Instance.new("TextLabel")
    TitleLabel.Font = Enum.Font.GothamBold
    TitleLabel.Text = GuiConfig.Title
    TitleLabel.TextColor3 = ConfigColor
    TitleLabel.TextSize = 14
    TitleLabel.TextXAlignment = Enum.TextXAlignment.Left
    TitleLabel.BackgroundTransparency = 1
    TitleLabel.Size = UDim2.new(1, -100, 1, 0)
    TitleLabel.Position = UDim2.new(0, 10, 0, 0)
    TitleLabel.Parent = Top

    local FooterLabel = Instance.new("TextLabel")
    FooterLabel.Font = Enum.Font.GothamBold
    FooterLabel.Text = GuiConfig.Footer
    FooterLabel.TextColor3 = CACHE.Colors.White
    FooterLabel.TextSize = 12
    FooterLabel.TextXAlignment = Enum.TextXAlignment.Left
    FooterLabel.BackgroundTransparency = 1
    FooterLabel.Size = UDim2.new(1, -(TitleLabel.TextBounds.X + 104), 1, 0)
    FooterLabel.Position = UDim2.new(0, TitleLabel.TextBounds.X + 15, 0, 0)
    FooterLabel.Parent = Top

    -- Close Button
    local CloseBtn = Instance.new("TextButton")
    CloseBtn.BackgroundTransparency = 1
    CloseBtn.AnchorPoint = Vector2.new(1, 0.5)
    CloseBtn.Position = UDim2.new(1, -8, 0.5, 0)
    CloseBtn.Size = UDim2.new(0, 25, 0, 25)
    CloseBtn.Name = "Close"
    CloseBtn.Parent = Top

    local CloseImg = Instance.new("ImageLabel")
    CloseImg.Image = "rbxassetid://9886659671"
    CloseImg.AnchorPoint = Vector2.new(0.5, 0.5)
    CloseImg.BackgroundTransparency = 1
    CloseImg.Position = UDim2.new(0.49, 0, 0.5, 0)
    CloseImg.Size = UDim2.new(1, -8, 1, -8)
    CloseImg.Parent = CloseBtn

    -- Minimize Button
    local MinBtn = Instance.new("TextButton")
    MinBtn.BackgroundTransparency = 1
    MinBtn.AnchorPoint = Vector2.new(1, 0.5)
    MinBtn.Position = UDim2.new(1, -38, 0.5, 0)
    MinBtn.Size = UDim2.new(0, 25, 0, 25)
    MinBtn.Name = "Min"
    MinBtn.Parent = Top

    local MinImg = Instance.new("ImageLabel")
    MinImg.Image = "rbxassetid://9886659276"
    MinImg.ImageTransparency = 0.2
    MinImg.AnchorPoint = Vector2.new(0.5, 0.5)
    MinImg.BackgroundTransparency = 1
    MinImg.Position = UDim2.new(0.5, 0, 0.5, 0)
    MinImg.Size = UDim2.new(1, -9, 1, -9)
    MinImg.Parent = MinBtn

    -- LayersTab
    local LayersTab = Instance.new("Frame")
    LayersTab.BackgroundTransparency = 1
    LayersTab.Position = UDim2.new(0, 9, 0, 50)
    LayersTab.Size = UDim2.new(0, GuiConfig["Tab Width"], 1, -59)
    LayersTab.Name = "LayersTab"
    LayersTab.Parent = Main

    local LayersTabCorner = Instance.new("UICorner")
    LayersTabCorner.CornerRadius = UDim.new(0, 2)
    LayersTabCorner.Parent = LayersTab

    -- DecideFrame
    local DecideFrame = Instance.new("Frame")
    DecideFrame.AnchorPoint = Vector2.new(0.5, 0)
    DecideFrame.BackgroundTransparency = 0.85
    DecideFrame.Position = UDim2.new(0.5, 0, 0, 38)
    DecideFrame.Size = UDim2.new(1, 0, 0, 1)
    DecideFrame.Name = "DecideFrame"
    DecideFrame.Parent = Main

    -- Layers
    local Layers = Instance.new("Frame")
    Layers.BackgroundTransparency = 1
    Layers.Position = UDim2.new(0, GuiConfig["Tab Width"] + 18, 0, 50)
    Layers.Size = UDim2.new(1, -(GuiConfig["Tab Width"] + 9 + 18), 1, -59)
    Layers.Name = "Layers"
    Layers.Parent = Main

    local LayersCorner = Instance.new("UICorner")
    LayersCorner.CornerRadius = UDim.new(0, 2)
    LayersCorner.Parent = Layers

    local NameTab = Instance.new("TextLabel")
    NameTab.Font = Enum.Font.GothamBold
    NameTab.Text = ""
    NameTab.TextColor3 = CACHE.Colors.White
    NameTab.TextSize = 24
    NameTab.TextWrapped = true
    NameTab.TextXAlignment = Enum.TextXAlignment.Left
    NameTab.BackgroundTransparency = 1
    NameTab.Size = UDim2.new(1, 0, 0, 30)
    NameTab.Name = "NameTab"
    NameTab.Parent = Layers

    local LayersReal = Instance.new("Frame")
    LayersReal.AnchorPoint = Vector2.new(0, 1)
    LayersReal.BackgroundTransparency = 1
    LayersReal.ClipsDescendants = true
    LayersReal.Position = UDim2.new(0, 0, 1, 0)
    LayersReal.Size = UDim2.new(1, 0, 1, -33)
    LayersReal.Name = "LayersReal"
    LayersReal.Parent = Layers

    local LayersFolder = Instance.new("Frame")
    LayersFolder.BackgroundTransparency = 1
    LayersFolder.Size = UDim2.new(1, 0, 1, 0)
    LayersFolder.Name = "LayersFolder"
    LayersFolder.Parent = LayersReal

    local LayersPageLayout = Instance.new("UIPageLayout")
    LayersPageLayout.SortOrder = Enum.SortOrder.LayoutOrder
    LayersPageLayout.Name = "LayersPageLayout"
    LayersPageLayout.Parent = LayersFolder
    LayersPageLayout.TweenTime = 0.5
    LayersPageLayout.EasingDirection = Enum.EasingDirection.InOut
    LayersPageLayout.EasingStyle = Enum.EasingStyle.Quad

    -- ScrollTab
    local ScrollTab = Instance.new("ScrollingFrame")
    ScrollTab.CanvasSize = UDim2.new(0, 0, 1.1, 0)
    ScrollTab.ScrollBarImageColor3 = CACHE.Colors.Black
    ScrollTab.ScrollBarThickness = 0
    ScrollTab.Active = true
    ScrollTab.BackgroundTransparency = 1
    ScrollTab.Size = UDim2.new(1, 0, 1, 0)
    ScrollTab.Name = "ScrollTab"
    ScrollTab.Parent = LayersTab

    local UIListLayout = Instance.new("UIListLayout")
    UIListLayout.Padding = UDim.new(0, 3)
    UIListLayout.SortOrder = Enum.SortOrder.LayoutOrder
    UIListLayout.Parent = ScrollTab

    local function UpdateSize1()
        pcall(function()
            ScrollTab.CanvasSize = UDim2.new(0, 0, 0, UIListLayout.AbsoluteContentSize.Y + 6)
        end)
    end

    allConnections[#allConnections + 1] = UIListLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(UpdateSize1)
    allConnections[#allConnections + 1] = ScrollTab.ChildAdded:Connect(UpdateSize1)
    allConnections[#allConnections + 1] = ScrollTab.ChildRemoved:Connect(UpdateSize1)

    -- Search functionality
    local SearchResults, SearchResultsLayout, SearchBox
    if GuiConfig.Search then
        local SearchBar = Instance.new("Frame")
        SearchBar.BackgroundTransparency = 0.93
        SearchBar.Position = UDim2.new(0, 0, 0, 0)
        SearchBar.Size = UDim2.new(1, 0, 0, 28)
        SearchBar.Name = "SearchBar"
        SearchBar.Parent = LayersTab

        local SearchCorner = Instance.new("UICorner")
        SearchCorner.CornerRadius = UDim.new(0, 4)
        SearchCorner.Parent = SearchBar

        local SearchIcon = Instance.new("ImageLabel")
        SearchIcon.Image = Icons.scan
        SearchIcon.ImageColor3 = CACHE.Colors.Gray200
        SearchIcon.BackgroundTransparency = 1
        SearchIcon.ScaleType = Enum.ScaleType.Fit
        SearchIcon.Position = UDim2.new(0, 7, 0.5, 0)
        SearchIcon.AnchorPoint = Vector2.new(0, 0.5)
        SearchIcon.Size = UDim2.new(0, 14, 0, 14)
        SearchIcon.Name = "SearchIcon"
        SearchIcon.Parent = SearchBar

        SearchBox = Instance.new("TextBox")
        SearchBox.Font = Enum.Font.GothamBold
        SearchBox.PlaceholderText = "Search..."
        SearchBox.PlaceholderColor3 = Color3.fromRGB(130, 130, 130)
        SearchBox.Text = ""
        SearchBox.TextColor3 = CACHE.Colors.White
        SearchBox.TextSize = 12
        SearchBox.TextXAlignment = Enum.TextXAlignment.Left
        SearchBox.ClearTextOnFocus = false
        SearchBox.BackgroundTransparency = 1
        SearchBox.AnchorPoint = Vector2.new(0, 0.5)
        SearchBox.Position = UDim2.new(0, 28, 0.5, 0)
        SearchBox.Size = UDim2.new(1, -34, 1, -6)
        SearchBox.Name = "SearchBox"
        SearchBox.Parent = SearchBar

        SearchResults = Instance.new("ScrollingFrame")
        SearchResults.Active = true
        SearchResults.BackgroundColor3 = Color3.fromRGB(15, 15, 15)
        SearchResults.BackgroundTransparency = 0.05
        SearchResults.ScrollBarThickness = 2
        SearchResults.ScrollBarImageColor3 = ConfigColor
        SearchResults.CanvasSize = UDim2.new(0, 0, 0, 0)
        SearchResults.Position = UDim2.new(0, 0, 0, 34)
        SearchResults.Size = UDim2.new(1, 0, 1, -34)
        SearchResults.Visible = false
        SearchResults.ZIndex = 20
        SearchResults.Name = "SearchResults"
        SearchResults.Parent = LayersTab

        local SearchResultsCorner = Instance.new("UICorner")
        SearchResultsCorner.CornerRadius = UDim.new(0, 4)
        SearchResultsCorner.Parent = SearchResults

        SearchResultsLayout = Instance.new("UIListLayout")
        SearchResultsLayout.Padding = UDim.new(0, 4)
        SearchResultsLayout.SortOrder = Enum.SortOrder.LayoutOrder
        SearchResultsLayout.Parent = SearchResults

        allConnections[#allConnections + 1] = SearchResultsLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
            pcall(function()
                SearchResults.CanvasSize = UDim2.new(0, 0, 0, SearchResultsLayout.AbsoluteContentSize.Y + 8)
            end)
        end)

        local function RunSearch()
            local q = string.gsub(string.gsub(string.lower(SearchBox.Text), "^%s+", ""), "%s+$", "")
            for _, c in SearchResults:GetChildren() do
                if c:IsA("GuiObject") then c:Destroy() end
            end
            if q == "" then
                SearchResults.Visible = false
                ScrollTab.Visible = true
                return
            end
            ScrollTab.Visible = false
            SearchResults.Visible = true

            local scored = {}
            for _, entry in ipairs(SearchRegistry) do
                local score = SmartMatch(q, entry.label)
                if score > 0 then
                    scored[#scored + 1] = { entry = entry, score = score }
                end
            end
            table.sort(scored, function(a, b) return a.score > b.score end)

            local found = 0
            for _, s in ipairs(scored) do
                if found >= 15 then break end
                local entry = s.entry

                local Row = Instance.new("Frame")
                Row.BackgroundTransparency = 0.93
                Row.Size = UDim2.new(1, 0, 0, 40)
                Row.LayoutOrder = found
                Row.ZIndex = 21
                Row.Name = "Result"
                Row.Parent = SearchResults

                local RowCorner = Instance.new("UICorner")
                RowCorner.CornerRadius = UDim.new(0, 4)
                RowCorner.Parent = Row

                local RowLabel = Instance.new("TextLabel")
                RowLabel.Font = Enum.Font.GothamBold
                RowLabel.Text = entry.label
                RowLabel.TextColor3 = Color3.fromRGB(235, 235, 235)
                RowLabel.TextSize = 12
                RowLabel.TextXAlignment = Enum.TextXAlignment.Left
                RowLabel.TextTruncate = Enum.TextTruncate.AtEnd
                RowLabel.BackgroundTransparency = 1
                RowLabel.Position = UDim2.new(0, 8, 0, 6)
                RowLabel.Size = UDim2.new(1, -16, 0, 14)
                RowLabel.ZIndex = 22
                RowLabel.Parent = Row

                local RowTab = Instance.new("TextLabel")
                RowTab.Font = Enum.Font.Gotham
                RowTab.Text = entry.tab .. (entry.kind and (" • " .. entry.kind) or "")
                RowTab.TextColor3 = ConfigColor
                RowTab.TextSize = 10
                RowTab.TextXAlignment = Enum.TextXAlignment.Left
                RowTab.BackgroundTransparency = 1
                RowTab.Position = UDim2.new(0, 8, 0, 22)
                RowTab.Size = UDim2.new(1, -16, 0, 12)
                RowTab.ZIndex = 22
                RowTab.Parent = Row

                local RowButton = Instance.new("TextButton")
                RowButton.Text = ""
                RowButton.BackgroundTransparency = 1
                RowButton.Size = UDim2.new(1, 0, 1, 0)
                RowButton.ZIndex = 23
                RowButton.Parent = Row

                RowButton.Activated:Connect(function()
                    if entry.kind == "Toggle" and entry.element and entry.element.Set then
                        entry.element.Value = not entry.element.Value
                        entry.element:Set(entry.element.Value)
                    else
                        SearchBox.Text = ""
                        if entry.switch then entry.switch() end
                    end
                end)

                found = found + 1
            end

            if found == 0 then
                local Empty = Instance.new("TextLabel")
                Empty.Font = Enum.Font.GothamBold
                Empty.Text = "No results"
                Empty.TextColor3 = CACHE.Colors.Gray150
                Empty.TextSize = 12
                Empty.BackgroundTransparency = 1
                Empty.Size = UDim2.new(1, 0, 0, 40)
                Empty.ZIndex = 22
                Empty.Parent = SearchResults
            end
        end

        allConnections[#allConnections + 1] = SearchBox:GetPropertyChangedSignal("Text"):Connect(RunSearch)
        GuiFunc.FocusSearch = function()
            SearchBox:CaptureFocus()
        end
    end

    -- ============================================
    -- GuiFunc Methods
    -- ============================================

    function GuiFunc:ExportConfig()
        local payload = HttpService:JSONEncode({ Game = gameName, Version = CURRENT_VERSION, Data = ConfigData })
        if setclipboard then
            setclipboard(payload)
            than("Config copied to clipboard", 4, ConfigColor, "WisHub", "Export")
        end
        return payload
    end

    function GuiFunc:ImportConfig(str)
        if not str or str == "" then
            than("Paste a config string first", 4, CACHE.Colors.Red255, "WisHub", "Import")
            return false
        end
        local ok, dec = pcall(function() return HttpService:JSONDecode(str) end)
        if not ok or type(dec) ~= "table" then
            than("Invalid config format", 4, CACHE.Colors.Red255, "WisHub", "Import")
            return false
        end
        local data = dec.Data or dec
        local nextData = { _version = CURRENT_VERSION }
        for key, value in pairs(data) do
            if key ~= "_version" then
                nextData[key] = value
            end
        end
        ConfigData = nextData
        LoadConfigElements()
        than("Config imported", 4, ConfigColor, "WisHub", "Import")
        return true
    end

    function GuiFunc:GetConfigs()
        local out = {}
        if not listfiles then return out end
        EnsureConfigFolder()
        local ok, files = pcall(function() return listfiles(GameConfigFolder) end)
        if not ok or type(files) ~= "table" then return out end
        for _, f in ipairs(files) do
            local n = string.match(f, "([^/\\]+)%.json$")
            if n and n ~= "_autoload" then
                out[#out + 1] = n
            end
        end
        return out
    end

    function GuiFunc:SaveConfigAs(name)
        local cleanName = CleanFileName(name)
        if cleanName == "" then
            than("Enter a config name first", 4, CACHE.Colors.Red255, "WisHub", "Config")
            return false
        end
        if not SaveConfig(GetConfigPath(cleanName)) then
            than("Save unavailable", 4, CACHE.Colors.Red255, "WisHub", "Config")
            return false
        end
        than("Saved '" .. cleanName .. "'", 4, ConfigColor, "WisHub", "Config")
        return true, cleanName
    end

    function GuiFunc:LoadConfigByName(name)
        local cleanName = CleanFileName(name)
        if cleanName == "" then return false end
        local path = GetConfigPath(cleanName)
        if not (isfile and isfile(path)) then
            than("Config '" .. tostring(cleanName) .. "' not found", 4, CACHE.Colors.Red255, "WisHub", "Config")
            return false
        end
        local ok, dec = pcall(function() return HttpService:JSONDecode(readfile(path)) end)
        if not ok or type(dec) ~= "table" then
            than("Failed to read config", 4, CACHE.Colors.Red255, "WisHub", "Config")
            return false
        end
        local data = dec.Data or dec
        local nextData = { _version = CURRENT_VERSION }
        for key, value in pairs(data) do
            if key ~= "_version" then
                nextData[key] = value
            end
        end
        ConfigData = nextData
        LoadConfigElements()
        than("Loaded '" .. cleanName .. "'", 4, ConfigColor, "WisHub", "Config")
        return true
    end

    function GuiFunc:DeleteConfig(name)
        local cleanName = CleanFileName(name)
        local path = GetConfigPath(cleanName)
        if isfile and isfile(path) and delfile then
            delfile(path)
            than("Deleted '" .. cleanName .. "'", 4, CACHE.Colors.Orange255, "WisHub", "Config")
            return true
        end
        return false
    end

    function GuiFunc:SetAutoLoad(name, enabled)
        if not writefile then return end
        EnsureConfigFolder()
        local cleanName = CleanFileName(name)
        pcall(function()
            writefile(AutoLoadFile, HttpService:JSONEncode({
                Enabled = enabled == true and cleanName ~= "",
                Name = cleanName,
            }))
        end)
    end

    function GuiFunc:GetAutoLoad()
        if isfile and isfile(AutoLoadFile) then
            local ok, dec = pcall(function() return HttpService:JSONDecode(readfile(AutoLoadFile)) end)
            if ok and type(dec) == "table" and dec.Enabled ~= false then return dec.Name or "" end
        end
        return ""
    end

    function GuiFunc:DestroyGui()
        -- PERFORMANCE: Cleanup all connections
        for _, conn in ipairs(allConnections) do
            pcall(function() conn:Disconnect() end)
        end
        allConnections = {}

        if CoreGui:FindFirstChild(WISHUB_GUI_NAME) then
            NatUI:Destroy()
        end
        local toggleGui = CoreGui:FindFirstChild(WISHUB_TOGGLE_GUI_NAME)
        if toggleGui then
            toggleGui:Destroy()
        end
        ReleaseWishHubProtection()
    end

    -- Minimize Button
    allConnections[#allConnections + 1] = MinBtn.Activated:Connect(function()
        CircleClick(MinBtn, Mouse.X, Mouse.Y)
        DropShadowHolder.Visible = false
    end)

    -- Close Button with confirmation dialog
    allConnections[#allConnections + 1] = CloseBtn.Activated:Connect(function()
        CircleClick(CloseBtn, Mouse.X, Mouse.Y)

        local Overlay = Instance.new("Frame")
        Overlay.Size = UDim2.new(1, 0, 1, 0)
        Overlay.BackgroundColor3 = CACHE.Colors.Black
        Overlay.BackgroundTransparency = 0.3
        Overlay.ZIndex = 50
        Overlay.Parent = DropShadowHolder

        local Dialog = Instance.new("ImageLabel")
        Dialog.Size = UDim2.new(0, 300, 0, 150)
        Dialog.Position = UDim2.new(0.5, -150, 0.5, -75)
        Dialog.Image = "rbxassetid://9542022979"
        Dialog.BackgroundTransparency = 1
        Dialog.BorderSizePixel = 0
        Dialog.ZIndex = 51
        Dialog.Parent = Overlay

        local DialogCorner = Instance.new("UICorner")
        DialogCorner.CornerRadius = UDim.new(0, 8)
        DialogCorner.Parent = Dialog

        local DialogGlow = Instance.new("Frame")
        DialogGlow.Size = UDim2.new(0, 310, 0, 160)
        DialogGlow.Position = UDim2.new(0.5, -155, 0.5, -80)
        DialogGlow.BackgroundTransparency = 0.75
        DialogGlow.BorderSizePixel = 0
        DialogGlow.ZIndex = 50
        DialogGlow.Parent = Overlay

        local GlowCorner = Instance.new("UICorner")
        GlowCorner.CornerRadius = UDim.new(0, 10)
        GlowCorner.Parent = DialogGlow

        local Gradient = Instance.new("UIGradient")
        Gradient.Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0.0, CACHE.Colors.Cyan),
            ColorSequenceKeypoint.new(0.25, CACHE.Colors.White),
            ColorSequenceKeypoint.new(0.5, Color3.fromRGB(0, 140, 255)),
            ColorSequenceKeypoint.new(0.75, CACHE.Colors.White),
            ColorSequenceKeypoint.new(1.0, CACHE.Colors.Cyan)
        })
        Gradient.Rotation = 90
        Gradient.Parent = DialogGlow

        local Title = Instance.new("TextLabel")
        Title.Size = UDim2.new(1, 0, 0, 40)
        Title.Position = UDim2.new(0, 0, 0, 4)
        Title.BackgroundTransparency = 1
        Title.Font = Enum.Font.GothamBold
        Title.Text = "WisHub Window"
        Title.TextSize = 22
        Title.TextColor3 = CACHE.Colors.White
        Title.ZIndex = 52
        Title.Parent = Dialog

        local Message = Instance.new("TextLabel")
        Message.Size = UDim2.new(1, -20, 0, 60)
        Message.Position = UDim2.new(0, 10, 0, 30)
        Message.BackgroundTransparency = 1
        Message.Font = Enum.Font.Gotham
        Message.Text = "Do you want to close this window?\nYou will not be able to open it again"
        Message.TextSize = 14
        Message.TextColor3 = CACHE.Colors.Gray200
        Message.TextWrapped = true
        Message.ZIndex = 52
        Message.Parent = Dialog

        local Yes = Instance.new("TextButton")
        Yes.Size = UDim2.new(0.45, -10, 0, 35)
        Yes.Position = UDim2.new(0.05, 0, 1, -55)
        Yes.BackgroundTransparency = 0.935
        Yes.Text = "Yes"
        Yes.Font = Enum.Font.GothamBold
        Yes.TextSize = 15
        Yes.TextColor3 = CACHE.Colors.White
        Yes.ZIndex = 52
        Yes.Name = "Yes"
        Yes.Parent = Dialog

        local YesCorner = Instance.new("UICorner")
        YesCorner.CornerRadius = UDim.new(0, 6)
        YesCorner.Parent = Yes

        local Cancel = Instance.new("TextButton")
        Cancel.Size = UDim2.new(0.45, -10, 0, 35)
        Cancel.Position = UDim2.new(0.5, 10, 1, -55)
        Cancel.BackgroundTransparency = 0.935
        Cancel.Text = "Cancel"
        Cancel.Font = Enum.Font.GothamBold
        Cancel.TextSize = 15
        Cancel.TextColor3 = CACHE.Colors.White
        Cancel.ZIndex = 52
        Cancel.Name = "Cancel"
        Cancel.Parent = Dialog

        local CancelCorner = Instance.new("UICorner")
        CancelCorner.CornerRadius = UDim.new(0, 6)
        CancelCorner.Parent = Cancel

        Yes.MouseButton1Click:Connect(function()
            GuiFunc:DestroyGui()
        end)

        Cancel.MouseButton1Click:Connect(function()
            Overlay:Destroy()
        end)
    end)

    -- Toggle UI Button
    function GuiFunc:ToggleUI()
        local toggleGui = CoreGui:FindFirstChild(WISHUB_TOGGLE_GUI_NAME)
        if toggleGui then
            toggleGui:Destroy()
        end

        local ScreenGui = Instance.new("ScreenGui")
        ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
        ScreenGui.Name = WISHUB_TOGGLE_GUI_NAME
        AllowWishHubInstance(ScreenGui)
        ScreenGui.Parent = CoreGui

        local MainButton = Instance.new("ImageLabel")
        MainButton.Parent = ScreenGui
        MainButton.Size = UDim2.new(0, 50, 0, 50)
        MainButton.Position = UDim2.new(0, 20, 0, 100)
        MainButton.BackgroundTransparency = 1
        MainButton.Image = "rbxassetid://" .. (GuiConfig.Image or "")
        MainButton.ScaleType = Enum.ScaleType.Fit

        local ButtonCorner = Instance.new("UICorner")
        ButtonCorner.CornerRadius = UDim.new(0, 6)
        ButtonCorner.Parent = MainButton

        local Button = Instance.new("TextButton")
        Button.Parent = MainButton
        Button.Size = UDim2.new(1, 0, 1, 0)
        Button.BackgroundTransparency = 1
        Button.Text = ""

        local dragging = false
        local dragStart, startPos

        Button.MouseButton1Click:Connect(function()
            if DropShadowHolder then
                DropShadowHolder.Visible = not DropShadowHolder.Visible
            end
        end)

        local function update(input)
            local delta = input.Position - dragStart
            MainButton.Position = UDim2.new(
                startPos.X.Scale,
                startPos.X.Offset + delta.X,
                startPos.Y.Scale,
                startPos.Y.Offset + delta.Y
            )
        end

        Button.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                dragging = true
                dragStart = input.Position
                startPos = MainButton.Position
            end
        end)

        Button.InputEnded:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                dragging = false
            end
        end)

        UserInputService.InputChanged:Connect(function(input)
            if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
                update(input)
            end
        end)
    end

    GuiFunc:ToggleUI()

    DropShadowHolder.Size = UDim2.new(0, 115 + TitleLabel.TextBounds.X + 1 + FooterLabel.TextBounds.X, 0, 350)

    local dragConnections = MakeDraggable(Top, DropShadowHolder)
    for _, conn in ipairs(dragConnections) do
        allConnections[#allConnections + 1] = conn
    end

    -- MoreBlur for dropdowns
    local MoreBlur = Instance.new("Frame")
    MoreBlur.AnchorPoint = Vector2.new(1, 1)
    MoreBlur.BackgroundColor3 = CACHE.Colors.Black
    MoreBlur.BackgroundTransparency = 1
    MoreBlur.BorderSizePixel = 0
    MoreBlur.ClipsDescendants = true
    MoreBlur.Position = UDim2.new(1, 8, 1, 8)
    MoreBlur.Size = UDim2.new(1, 154, 1, 54)
    MoreBlur.Visible = false
    MoreBlur.Name = "MoreBlur"
    MoreBlur.Parent = Layers

    local DropShadowHolder1 = Instance.new("Frame")
    DropShadowHolder1.BackgroundTransparency = 1
    DropShadowHolder1.Size = UDim2.new(1, 0, 1, 0)
    DropShadowHolder1.ZIndex = 0
    DropShadowHolder1.Name = "DropShadowHolder"
    DropShadowHolder1.Parent = MoreBlur

    local DropShadow1 = Instance.new("ImageLabel")
    DropShadow1.Image = "rbxassetid://6015897843"
    DropShadow1.ImageColor3 = CACHE.Colors.Black
    DropShadow1.ImageTransparency = 0.5
    DropShadow1.ScaleType = Enum.ScaleType.Slice
    DropShadow1.SliceCenter = Rect.new(49, 49, 450, 450)
    DropShadow1.AnchorPoint = Vector2.new(0.5, 0.5)
    DropShadow1.BackgroundTransparency = 1
    DropShadow1.Size = UDim2.new(1, 35, 1, 35)
    DropShadow1.ZIndex = 0
    DropShadow1.Name = "DropShadow"
    DropShadow1.Parent = DropShadowHolder1

    local BlurCorner = Instance.new("UICorner")
    BlurCorner.Parent = MoreBlur

    local ConnectButton = Instance.new("TextButton")
    ConnectButton.BackgroundTransparency = 1
    ConnectButton.Size = UDim2.new(1, 0, 1, 0)
    ConnectButton.Name = "ConnectButton"
    ConnectButton.Parent = MoreBlur

    local DropdownSelect = Instance.new("Frame")
    DropdownSelect.AnchorPoint = Vector2.new(1, 0.5)
    DropdownSelect.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    DropdownSelect.BorderSizePixel = 0
    DropdownSelect.LayoutOrder = 1
    DropdownSelect.Position = UDim2.new(1, 172, 0.5, 0)
    DropdownSelect.Size = UDim2.new(0, 160, 1, -16)
    DropdownSelect.Name = "DropdownSelect"
    DropdownSelect.ClipsDescendants = true
    DropdownSelect.Parent = MoreBlur

    allConnections[#allConnections + 1] = ConnectButton.Activated:Connect(function()
        if MoreBlur.Visible then
            TweenService:Create(MoreBlur, CACHE.TweenInfo.Slow, { BackgroundTransparency = 1 }):Play()
            TweenService:Create(DropdownSelect, CACHE.TweenInfo.Slow, { Position = UDim2.new(1, 172, 0.5, 0) }):Play()
            task.wait(0.3)
            MoreBlur.Visible = false
        end
    end)

    local DropdownCorner = Instance.new("UICorner")
    DropdownCorner.CornerRadius = UDim.new(0, 3)
    DropdownCorner.Parent = DropdownSelect

    local DropdownStroke = Instance.new("UIStroke")
    DropdownStroke.Color = ConfigColor
    DropdownStroke.Thickness = 2.5
    DropdownStroke.Transparency = 0.8
    DropdownStroke.Parent = DropdownSelect

    local DropdownSelectReal = Instance.new("Frame")
    DropdownSelectReal.AnchorPoint = Vector2.new(0.5, 0.5)
    DropdownSelectReal.BackgroundColor3 = ConfigColor
    DropdownSelectReal.BackgroundTransparency = 0.7
    DropdownSelectReal.BorderSizePixel = 0
    DropdownSelectReal.LayoutOrder = 1
    DropdownSelectReal.Position = UDim2.new(0.5, 0, 0.5, 0)
    DropdownSelectReal.Size = UDim2.new(1, 1, 1, 1)
    DropdownSelectReal.Name = "DropdownSelectReal"
    DropdownSelectReal.Parent = DropdownSelect

    local DropdownFolder = Instance.new("Frame")
    DropdownFolder.Name = "DropdownFolder"
    DropdownFolder.Size = UDim2.new(1, 0, 1, 0)
    DropdownFolder.BackgroundTransparency = 1
    DropdownFolder.Parent = DropdownSelectReal

    local DropPageLayout = Instance.new("UIPageLayout")
    DropPageLayout.EasingDirection = Enum.EasingDirection.InOut
    DropPageLayout.EasingStyle = Enum.EasingStyle.Quad
    DropPageLayout.TweenTime = 0.01
    DropPageLayout.SortOrder = Enum.SortOrder.LayoutOrder
    DropPageLayout.FillDirection = Enum.FillDirection.Vertical
    DropPageLayout.Archivable = false
    DropPageLayout.Name = "DropPageLayout"
    DropPageLayout.Parent = DropdownFolder

    -- ============================================
    -- Tabs System
    -- ============================================

    local Tabs = {}
    local CountTab = 0
    local CountDropdown = 0

    function Tabs:AddTab(TabConfig)
        TabConfig = TabConfig or {}
        TabConfig.Name = TabConfig.Name or "Tab"
        TabConfig.Icon = TabConfig.Icon or ""

        local ScrolLayers = Instance.new("ScrollingFrame")
        ScrolLayers.ScrollBarImageColor3 = CACHE.Colors.Gray80
        ScrolLayers.ScrollBarThickness = 0
        ScrolLayers.Active = true
        ScrolLayers.LayoutOrder = CountTab
        ScrolLayers.BackgroundTransparency = 1
        ScrolLayers.Size = UDim2.new(1, 0, 1, 0)
        ScrolLayers.Name = "ScrolLayers"
        ScrolLayers.Parent = LayersFolder

        local ScrolLayout = Instance.new("UIListLayout")
        ScrolLayout.Padding = UDim.new(0, 3)
        ScrolLayout.SortOrder = Enum.SortOrder.LayoutOrder
        ScrolLayout.Parent = ScrolLayers

        local Tab = Instance.new("Frame")
        Tab.BackgroundColor3 = CACHE.Colors.White
        Tab.BackgroundTransparency = CountTab == 0 and 0.92 or 1
        Tab.BorderSizePixel = 0
        Tab.LayoutOrder = CountTab
        Tab.Size = UDim2.new(1, 0, 0, 30)
        Tab.Name = "Tab"
        Tab.Parent = ScrollTab

        local TabCorner = Instance.new("UICorner")
        TabCorner.CornerRadius = UDim.new(0, 4)
        TabCorner.Parent = Tab

        local TabButton = Instance.new("TextButton")
        TabButton.BackgroundTransparency = 1
        TabButton.Size = UDim2.new(1, 0, 1, 0)
        TabButton.Name = "TabButton"
        TabButton.Parent = Tab

        local TabName = Instance.new("TextLabel")
        TabName.Font = Enum.Font.GothamBold
        TabName.Text = "[ " .. tostring(TabConfig.Name) .. " ]"
        TabName.TextColor3 = CACHE.Colors.White
        TabName.TextSize = 13
        TabName.TextXAlignment = Enum.TextXAlignment.Left
        TabName.BackgroundTransparency = 1
        TabName.Position = UDim2.new(0, 30, 0, 0)
        TabName.Size = UDim2.new(1, 0, 1, 0)
        TabName.Name = "TabName"
        TabName.Parent = Tab

        local FeatureImg = Instance.new("ImageLabel")
        FeatureImg.BackgroundTransparency = 1
        FeatureImg.Position = UDim2.new(0, 9, 0, 7)
        FeatureImg.Size = UDim2.new(0, 16, 0, 16)
        FeatureImg.Name = "FeatureImg"
        FeatureImg.Parent = Tab

        if TabConfig.Icon ~= "" then
            if Icons[TabConfig.Icon] then
                FeatureImg.Image = Icons[TabConfig.Icon]
            else
                FeatureImg.Image = TabConfig.Icon
            end
        end

        -- PERFORMANCE: Cache for faster tab switching
        local ChooseFrame = nil
        if CountTab == 0 then
            LayersPageLayout:JumpToIndex(0)
            NameTab.Text = TabConfig.Name

            ChooseFrame = Instance.new("Frame")
            ChooseFrame.BackgroundColor3 = ConfigColor
            ChooseFrame.BorderSizePixel = 0
            ChooseFrame.Position = UDim2.new(0, 2, 0, 9)
            ChooseFrame.Size = UDim2.new(0, 1, 0, 12)
            ChooseFrame.Name = "ChooseFrame"
            ChooseFrame.Parent = Tab

            local ChooseStroke = Instance.new("UIStroke")
            ChooseStroke.Color = ConfigColor
            ChooseStroke.Thickness = 1.6
            ChooseStroke.Parent = ChooseFrame

            local ChooseCorner = Instance.new("UICorner")
            ChooseCorner.Parent = ChooseFrame
        end

        local function switchToTab(force)
            if ChooseFrame == nil then
                for _, child in Tab:GetChildren() do
                    if child.Name == "ChooseFrame" then
                        ChooseFrame = child
                        break
                    end
                end
            end

            if ChooseFrame and (force or Tab.LayoutOrder ~= LayersPageLayout.CurrentPage.LayoutOrder) then
                for _, TabFrame in ScrollTab:GetChildren() do
                    if TabFrame.Name == "Tab" then
                        TweenService:Create(TabFrame, CACHE.TweenInfo.Back, { BackgroundTransparency = 1 }):Play()
                    end
                end
                TweenService:Create(Tab, CACHE.TweenInfo.BackSlow, { BackgroundTransparency = 0.92 }):Play()
                TweenService:Create(ChooseFrame, CACHE.TweenInfo.Smooth, {
                    Position = UDim2.new(0, 2, 0, 9 + (33 * Tab.LayoutOrder))
                }):Play()
                LayersPageLayout:JumpToIndex(Tab.LayoutOrder)
                task.wait(0.05)
                NameTab.Text = TabConfig.Name
                TweenService:Create(ChooseFrame, CACHE.TweenInfo.Quad, { Size = UDim2.new(0, 1, 0, 20) }):Play()
                task.wait(0.2)
                TweenService:Create(ChooseFrame, CACHE.TweenInfo.Normal, { Size = UDim2.new(0, 1, 0, 12) }):Play()
            end
        end

        allConnections[#allConnections + 1] = TabButton.Activated:Connect(function()
            CircleClick(TabButton, Mouse.X, Mouse.Y)
            switchToTab(false)
        end)

        local function SearchSwitch()
            if SearchResults then
                SearchResults.Visible = false
                ScrollTab.Visible = true
            end
            switchToTab(true)
        end

        TabRegistry[TabConfig.Name] = SearchSwitch
        RegisterSearch({ label = TabConfig.Name, tab = TabConfig.Name, kind = "Tab", switch = SearchSwitch })

        -- ============================================
        -- Sections System
        -- ============================================

        local Sections = {}
        local CountSection = 0

        function Sections:AddSection(Title, AlwaysOpen)
            Title = Title or "Title"

            local Section = Instance.new("Frame")
            Section.BackgroundTransparency = 1
            Section.ClipsDescendants = true
            Section.LayoutOrder = CountSection
            Section.Size = UDim2.new(1, 0, 0, 30)
            Section.Name = "Section"
            Section.Parent = ScrolLayers

            local SectionReal = Instance.new("Frame")
            SectionReal.AnchorPoint = Vector2.new(0.5, 0)
            SectionReal.BackgroundTransparency = 0.935
            SectionReal.Position = UDim2.new(0.5, 0, 0, 0)
            SectionReal.Size = UDim2.new(1, 1, 0, 30)
            SectionReal.Name = "SectionReal"
            SectionReal.Parent = Section

            local SectionCorner = Instance.new("UICorner")
            SectionCorner.CornerRadius = UDim.new(0, 4)
            SectionCorner.Parent = SectionReal

            local SectionButton = Instance.new("TextButton")
            SectionButton.BackgroundTransparency = 1
            SectionButton.Size = UDim2.new(1, 0, 1, 0)
            SectionButton.Name = "SectionButton"
            SectionButton.Parent = SectionReal

            local FeatureFrame = Instance.new("Frame")
            FeatureFrame.AnchorPoint = Vector2.new(1, 0.5)
            FeatureFrame.BackgroundTransparency = 1
            FeatureFrame.Position = UDim2.new(1, -5, 0.5, 0)
            FeatureFrame.Size = UDim2.new(0, 20, 0, 20)
            FeatureFrame.Name = "FeatureFrame"
            FeatureFrame.Parent = SectionReal

            local FeatureImg = Instance.new("ImageLabel")
            FeatureImg.Image = "rbxassetid://16851841101"
            FeatureImg.AnchorPoint = Vector2.new(0.5, 0.5)
            FeatureImg.BackgroundTransparency = 1
            FeatureImg.Position = UDim2.new(0.5, 0, 0.5, 0)
            FeatureImg.Rotation = -90
            FeatureImg.Size = UDim2.new(1, 6, 1, 6)
            FeatureImg.Name = "FeatureImg"
            FeatureImg.Parent = FeatureFrame

            local SectionTitle = Instance.new("TextLabel")
            SectionTitle.Font = Enum.Font.GothamBold
            SectionTitle.Text = Title
            SectionTitle.TextColor3 = CACHE.Colors.Gray230
            SectionTitle.TextSize = 13
            SectionTitle.TextXAlignment = Enum.TextXAlignment.Left
            SectionTitle.TextYAlignment = Enum.TextYAlignment.Top
            SectionTitle.AnchorPoint = Vector2.new(0, 0.5)
            SectionTitle.BackgroundTransparency = 1
            SectionTitle.Position = UDim2.new(0, 10, 0.5, 0)
            SectionTitle.Size = UDim2.new(1, -50, 0, 13)
            SectionTitle.Name = "SectionTitle"
            SectionTitle.Parent = SectionReal

            local SectionDecideFrame = Instance.new("Frame")
            SectionDecideFrame.BackgroundTransparency = 1
            SectionDecideFrame.AnchorPoint = Vector2.new(0.5, 0)
            SectionDecideFrame.Position = UDim2.new(0.5, 0, 0, 33)
            SectionDecideFrame.Size = UDim2.new(0, 0, 0, 2)
            SectionDecideFrame.Name = "SectionDecideFrame"
            SectionDecideFrame.Parent = Section

            local DecCorner = Instance.new("UICorner")
            DecCorner.Parent = SectionDecideFrame

            local DecGradient = Instance.new("UIGradient")
            DecGradient.Color = ColorSequence.new {
                ColorSequenceKeypoint.new(0, CACHE.Colors.Gray20),
                ColorSequenceKeypoint.new(0.5, ConfigColor),
                ColorSequenceKeypoint.new(1, CACHE.Colors.Gray20)
            }
            DecGradient.Parent = SectionDecideFrame

            local SectionAdd = Instance.new("Frame")
            SectionAdd.AnchorPoint = Vector2.new(0.5, 0)
            SectionAdd.BackgroundTransparency = 1
            SectionAdd.ClipsDescendants = true
            SectionAdd.Position = UDim2.new(0.5, 0, 0, 38)
            SectionAdd.Size = UDim2.new(1, 0, 0, 100)
            SectionAdd.Name = "SectionAdd"
            SectionAdd.Parent = Section

            local AddCorner = Instance.new("UICorner")
            AddCorner.CornerRadius = UDim.new(0, 2)
            AddCorner.Parent = SectionAdd

            local AddLayout = Instance.new("UIListLayout")
            AddLayout.Padding = UDim.new(0, 3)
            AddLayout.SortOrder = Enum.SortOrder.LayoutOrder
            AddLayout.Parent = SectionAdd

            local OpenSection = false

            -- PERFORMANCE: Debounced size update
            local resizeTimeout = nil
            local function SafeUpdateSizeSection()
                if resizeTimeout then return end
                resizeTimeout = task.delay(0.05, function()
                    resizeTimeout = nil
                    pcall(UpdateSizeSection)
                end)
            end

            local function UpdateSizeScroll()
                local OffsetY = 0
                for _, child in ScrolLayers:GetChildren() do
                    if child.Name ~= "UIListLayout" then
                        OffsetY = OffsetY + 3 + child.Size.Y.Offset
                    end
                end
                ScrolLayers.CanvasSize = UDim2.new(0, 0, 0, OffsetY)
            end

            local function UpdateSizeSection()
                if OpenSection then
                    local SectionSizeYWitdh = 38
                    for _, v in SectionAdd:GetChildren() do
                        if v.Name ~= "UIListLayout" and v.Name ~= "UICorner" then
                            SectionSizeYWitdh = SectionSizeYWitdh + v.Size.Y.Offset + 3
                        end
                    end
                    TweenService:Create(FeatureFrame, CACHE.TweenInfo.Smooth, { Rotation = 90 }):Play()
                    TweenService:Create(Section, CACHE.TweenInfo.Smooth, { Size = UDim2.new(1, 1, 0, SectionSizeYWitdh) }):Play()
                    TweenService:Create(SectionAdd, CACHE.TweenInfo.Smooth, { Size = UDim2.new(1, 0, 0, SectionSizeYWitdh - 38) }):Play()
                    TweenService:Create(SectionDecideFrame, CACHE.TweenInfo.Smooth, { Size = UDim2.new(1, 0, 0, 2) }):Play()
                    task.wait(0.5)
                    UpdateSizeScroll()
                end
            end

            if AlwaysOpen == true then
                SectionButton:Destroy()
                FeatureFrame:Destroy()
                OpenSection = true
                UpdateSizeSection()
            elseif AlwaysOpen == false then
                OpenSection = true
                UpdateSizeSection()
            end

            if AlwaysOpen ~= true then
                allConnections[#allConnections + 1] = SectionButton.Activated:Connect(function()
                    CircleClick(SectionButton, Mouse.X, Mouse.Y)
                    if OpenSection then
                        TweenService:Create(FeatureFrame, CACHE.TweenInfo.Smooth, { Rotation = 0 }):Play()
                        TweenService:Create(Section, CACHE.TweenInfo.Smooth, { Size = UDim2.new(1, 1, 0, 30) }):Play()
                        TweenService:Create(SectionDecideFrame, CACHE.TweenInfo.Smooth, { Size = UDim2.new(0, 0, 0, 2) }):Play()
                        OpenSection = false
                        task.wait(0.5)
                        UpdateSizeScroll()
                    else
                        OpenSection = true
                        UpdateSizeSection()
                    end
                end)
            end

            if AlwaysOpen == true or AlwaysOpen == false then
                OpenSection = true
                local SectionSizeYWitdh = 38
                for _, v in SectionAdd:GetChildren() do
                    if v.Name ~= "UIListLayout" and v.Name ~= "UICorner" then
                        SectionSizeYWitdh = SectionSizeYWitdh + v.Size.Y.Offset + 3
                    end
                end
                FeatureFrame.Rotation = 90
                Section.Size = UDim2.new(1, 1, 0, SectionSizeYWitdh)
                SectionAdd.Size = UDim2.new(1, 0, 0, SectionSizeYWitdh - 38)
                SectionDecideFrame.Size = UDim2.new(1, 0, 0, 2)
                UpdateSizeScroll()
            end

            allConnections[#allConnections + 1] = SectionAdd.ChildAdded:Connect(SafeUpdateSizeSection)
            allConnections[#allConnections + 1] = SectionAdd.ChildRemoved:Connect(SafeUpdateSizeSection)

            local layout = ScrolLayers:FindFirstChildOfClass("UIListLayout")
            if layout then
                allConnections[#allConnections + 1] = layout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
                    pcall(function()
                        ScrolLayers.CanvasSize = UDim2.new(0, 0, 0, layout.AbsoluteContentSize.Y + 10)
                    end)
                end)
            end

            -- ============================================
            -- Items System
            -- ============================================

            local Items = {}
            local CountItem = 0

            -- PERFORMANCE: Optimized GetTextHeight
            local textSizeCache = {}
            local function GetTextHeightCached(text, textSize, font, width)
                local cacheKey = text .. "|" .. textSize .. "|" .. width
                if textSizeCache[cacheKey] then
                    return textSizeCache[cacheKey]
                end
                local ok, size = pcall(function()
                    return TextService:GetTextSize(text, textSize, font, Vector2.new(width, math.huge))
                end)
                local result
                if ok and size then
                    result = math.ceil(size.Y)
                else
                    result = textSize
                end
                textSizeCache[cacheKey] = result
                return result
            end

            function Items:AddParagraph(ParagraphConfig)
                ParagraphConfig = ParagraphConfig or {}
                ParagraphConfig.Title = ParagraphConfig.Title or ParagraphConfig.Name or "Title"
                ParagraphConfig.Content = ParagraphConfig.Content or ParagraphConfig.Description or ParagraphConfig.Text or "Content"
                ParagraphConfig.ButtonText = ParagraphConfig.ButtonText or ParagraphConfig.Button
                ParagraphConfig.ButtonCallback = ParagraphConfig.ButtonCallback or ParagraphConfig.Callback

                local ParagraphFunc = {}

                local Paragraph = Instance.new("Frame")
                Paragraph.BackgroundTransparency = 0.935
                Paragraph.LayoutOrder = CountItem
                Paragraph.Size = UDim2.new(1, 0, 0, 46)
                Paragraph.Name = "Paragraph"
                Paragraph.Parent = SectionAdd

                local ParagraphCorner = Instance.new("UICorner")
                ParagraphCorner.CornerRadius = UDim.new(0, 4)
                ParagraphCorner.Parent = Paragraph

                local leftPadding = 10
                local ParagraphIcon
                if ParagraphConfig.Icon and tostring(ParagraphConfig.Icon) ~= "" then
                    ParagraphIcon = Instance.new("ImageLabel")
                    ParagraphIcon.Size = UDim2.new(0, 20, 0, 20)
                    ParagraphIcon.Position = UDim2.new(0, 8, 0, 12)
                    ParagraphIcon.BackgroundTransparency = 1
                    ParagraphIcon.Name = "ParagraphIcon"
                    ParagraphIcon.Parent = Paragraph

                    if Icons[ParagraphConfig.Icon] then
                        ParagraphIcon.Image = Icons[ParagraphConfig.Icon]
                    else
                        ParagraphIcon.Image = tostring(ParagraphConfig.Icon)
                    end
                    leftPadding = 36
                end

                local ParagraphTitle = Instance.new("TextLabel")
                ParagraphTitle.Font = Enum.Font.GothamBold
                ParagraphTitle.Text = tostring(ParagraphConfig.Title)
                ParagraphTitle.TextColor3 = CACHE.Colors.Gray230
                ParagraphTitle.TextSize = 13
                ParagraphTitle.TextXAlignment = Enum.TextXAlignment.Left
                ParagraphTitle.TextYAlignment = Enum.TextYAlignment.Top
                ParagraphTitle.BackgroundTransparency = 1
                ParagraphTitle.Position = UDim2.new(0, leftPadding, 0, 9)
                ParagraphTitle.Size = UDim2.new(1, -(leftPadding + 10), 0, 16)
                ParagraphTitle.Name = "ParagraphTitle"
                ParagraphTitle.Parent = Paragraph

                local ParagraphContent = Instance.new("TextLabel")
                ParagraphContent.Font = Enum.Font.Gotham
                ParagraphContent.Text = tostring(ParagraphConfig.Content)
                ParagraphContent.TextColor3 = CACHE.Colors.White
                ParagraphContent.TextSize = 12
                ParagraphContent.TextXAlignment = Enum.TextXAlignment.Left
                ParagraphContent.TextYAlignment = Enum.TextYAlignment.Top
                ParagraphContent.BackgroundTransparency = 1
                ParagraphContent.Position = UDim2.new(0, leftPadding, 0, 26)
                ParagraphContent.TextWrapped = true
                ParagraphContent.RichText = ParagraphConfig.RichText ~= false
                ParagraphContent.Parent = Paragraph

                local ParagraphButton
                if ParagraphConfig.ButtonText then
                    ParagraphButton = Instance.new("TextButton")
                    ParagraphButton.Position = UDim2.new(0, 10, 0, 44)
                    ParagraphButton.Size = UDim2.new(1, -20, 0, 28)
                    ParagraphButton.BackgroundTransparency = 0.935
                    ParagraphButton.Font = Enum.Font.GothamBold
                    ParagraphButton.TextSize = 12
                    ParagraphButton.TextTransparency = 0.3
                    ParagraphButton.TextColor3 = CACHE.Colors.White
                    ParagraphButton.Text = tostring(ParagraphConfig.ButtonText)
                    ParagraphButton.Name = "ParagraphButton"
                    ParagraphButton.Parent = Paragraph

                    local btnCorner = Instance.new("UICorner")
                    btnCorner.CornerRadius = UDim.new(0, 6)
                    btnCorner.Parent = ParagraphButton

                    if ParagraphConfig.ButtonCallback then
                        allConnections[#allConnections + 1] = ParagraphButton.Activated:Connect(ParagraphConfig.ButtonCallback)
                    end
                end

                local resizeQueued = false
                local function QueueSectionResize()
                    if resizeQueued then return end
                    resizeQueued = true
                    task.defer(function()
                        resizeQueued = false
                        pcall(UpdateSizeSection)
                    end)
                end

                local function UpdateSize()
                    local width = Paragraph.AbsoluteSize.X
                    if width <= 0 then width = SectionAdd.AbsoluteSize.X end
                    width = math.max(20, width - leftPadding - 10)

                    local contentHeight = math.max(14, GetTextHeightCached(
                        ParagraphContent.Text,
                        ParagraphContent.TextSize,
                        ParagraphContent.Font,
                        width
                    ))

                    ParagraphContent.Size = UDim2.new(1, -(leftPadding + 10), 0, contentHeight)

                    local totalHeight = 26 + contentHeight + 10
                    if ParagraphButton then
                        local buttonTop = 26 + contentHeight + 8
                        ParagraphButton.Position = UDim2.new(0, 10, 0, buttonTop)
                        totalHeight = buttonTop + ParagraphButton.Size.Y.Offset + 8
                    end

                    Paragraph.Size = UDim2.new(1, 0, 0, math.max(46, totalHeight))
                    QueueSectionResize()
                end

                allConnections[#allConnections + 1] = Paragraph:GetPropertyChangedSignal("AbsoluteSize"):Connect(UpdateSize)
                task.defer(UpdateSize)

                function ParagraphFunc:SetTitle(title)
                    ParagraphTitle.Text = tostring(title or "Title")
                    RegisterSearch({ label = ParagraphTitle.Text, tab = TabConfig.Name, kind = "Info", switch = SearchSwitch })
                end

                function ParagraphFunc:SetContent(content)
                    content = content or "Content"
                    ParagraphFunc.Value = content
                    ParagraphContent.Text = tostring(content)
                    UpdateSize()
                end

                function ParagraphFunc:Set(data)
                    if type(data) == "table" then
                        if data.Title or data.Name then
                            ParagraphFunc:SetTitle(data.Title or data.Name)
                        end
                        if data.Content or data.Description or data.Text then
                            ParagraphFunc:SetContent(data.Content or data.Description or data.Text)
                        end
                    else
                        ParagraphFunc:SetContent(data)
                    end
                end

                function ParagraphFunc:Destroy()
                    Paragraph:Destroy()
                    QueueSectionResize()
                end

                CountItem = CountItem + 1
                RegisterSearch({ label = ParagraphConfig.Title, tab = TabConfig.Name, kind = "Info", switch = SearchSwitch })
                return ParagraphFunc
            end

            function Items:AddPanel(PanelConfig)
                PanelConfig = PanelConfig or {}
                PanelConfig.Title = PanelConfig.Title or "Title"
                PanelConfig.Content = PanelConfig.Content or ""
                PanelConfig.Placeholder = PanelConfig.Placeholder or nil
                PanelConfig.Default = PanelConfig.Default or ""
                PanelConfig.ButtonText = PanelConfig.Button or PanelConfig.ButtonText or "Confirm"
                PanelConfig.ButtonCallback = PanelConfig.Callback or PanelConfig.ButtonCallback or function() end
                PanelConfig.SubButtonText = PanelConfig.SubButton or PanelConfig.SubButtonText or nil
                PanelConfig.SubButtonCallback = PanelConfig.SubCallback or PanelConfig.SubButtonCallback or function() end

                local configKey = ShouldUseConfig(PanelConfig) and ("Panel_" .. PanelConfig.Title) or nil
                if configKey and ConfigData[configKey] ~= nil then
                    PanelConfig.Default = ConfigData[configKey]
                end

                local PanelFunc = { Value = PanelConfig.Default }

                local baseHeight = 50
                if PanelConfig.Placeholder then baseHeight = baseHeight + 40 end
                if PanelConfig.SubButtonText then
                    baseHeight = baseHeight + 40
                else
                    baseHeight = baseHeight + 36
                end

                local Panel = Instance.new("Frame")
                Panel.BackgroundTransparency = 0.935
                Panel.Size = UDim2.new(1, 0, 0, baseHeight)
                Panel.LayoutOrder = CountItem
                Panel.Parent = SectionAdd

                local PanelCorner = Instance.new("UICorner")
                PanelCorner.CornerRadius = UDim.new(0, 4)
                PanelCorner.Parent = Panel

                local Title = Instance.new("TextLabel")
                Title.Font = Enum.Font.GothamBold
                Title.Text = PanelConfig.Title
                Title.TextSize = 13
                Title.TextColor3 = CACHE.Colors.White
                Title.TextXAlignment = Enum.TextXAlignment.Left
                Title.BackgroundTransparency = 1
                Title.Position = UDim2.new(0, 10, 0, 10)
                Title.Size = UDim2.new(1, -20, 0, 13)
                Title.Parent = Panel

                local Content = Instance.new("TextLabel")
                Content.Font = Enum.Font.Gotham
                Content.Text = PanelConfig.Content
                Content.TextSize = 12
                Content.TextColor3 = CACHE.Colors.White
                Content.TextXAlignment = Enum.TextXAlignment.Left
                Content.BackgroundTransparency = 1
                Content.RichText = true
                Content.Position = UDim2.new(0, 10, 0, 28)
                Content.Size = UDim2.new(1, -20, 0, 14)
                Content.Parent = Panel

                local InputBox
                if PanelConfig.Placeholder then
                    local InputFrame = Instance.new("Frame")
                    InputFrame.AnchorPoint = Vector2.new(0.5, 0)
                    InputFrame.BackgroundTransparency = 0.95
                    InputFrame.Position = UDim2.new(0.5, 0, 0, 48)
                    InputFrame.Size = UDim2.new(1, -20, 0, 30)
                    InputFrame.Parent = Panel

                    local inputCorner = Instance.new("UICorner")
                    inputCorner.CornerRadius = UDim.new(0, 4)
                    inputCorner.Parent = InputFrame

                    InputBox = Instance.new("TextBox")
                    InputBox.Font = Enum.Font.GothamBold
                    InputBox.PlaceholderText = PanelConfig.Placeholder
                    InputBox.PlaceholderColor3 = Color3.fromRGB(120, 120, 120)
                    InputBox.Text = PanelConfig.Default
                    InputBox.TextSize = 11
                    InputBox.TextColor3 = CACHE.Colors.White
                    InputBox.BackgroundTransparency = 1
                    InputBox.TextXAlignment = Enum.TextXAlignment.Left
                    InputBox.Size = UDim2.new(1, -10, 1, -6)
                    InputBox.Position = UDim2.new(0, 5, 0, 3)
                    InputBox.Parent = InputFrame
                end

                local yBtn = PanelConfig.Placeholder and 88 or 48

                local ButtonMain = Instance.new("TextButton")
                ButtonMain.Font = Enum.Font.GothamBold
                ButtonMain.Text = PanelConfig.ButtonText
                ButtonMain.TextSize = 12
                ButtonMain.TextTransparency = 0.3
                ButtonMain.TextColor3 = CACHE.Colors.White
                ButtonMain.BackgroundTransparency = 0.935
                ButtonMain.Size = PanelConfig.SubButtonText and UDim2.new(0.5, -12, 0, 30) or UDim2.new(1, -20, 0, 30)
                ButtonMain.Position = UDim2.new(0, 10, 0, yBtn)
                ButtonMain.Parent = Panel

                local btnCorner = Instance.new("UICorner")
                btnCorner.CornerRadius = UDim.new(0, 6)
                btnCorner.Parent = ButtonMain

                allConnections[#allConnections + 1] = ButtonMain.MouseButton1Click:Connect(function()
                    PanelConfig.ButtonCallback(InputBox and InputBox.Text or "")
                end)

                if PanelConfig.SubButtonText then
                    local SubButton = Instance.new("TextButton")
                    SubButton.Font = Enum.Font.GothamBold
                    SubButton.Text = PanelConfig.SubButtonText
                    SubButton.TextSize = 12
                    SubButton.TextTransparency = 0.3
                    SubButton.TextColor3 = CACHE.Colors.White
                    SubButton.BackgroundTransparency = 0.935
                    SubButton.Size = UDim2.new(0.5, -12, 0, 30)
                    SubButton.Position = UDim2.new(0.5, 2, 0, yBtn)
                    SubButton.Parent = Panel

                    local subCorner = Instance.new("UICorner")
                    subCorner.CornerRadius = UDim.new(0, 6)
                    subCorner.Parent = SubButton

                    allConnections[#allConnections + 1] = SubButton.MouseButton1Click:Connect(function()
                        PanelConfig.SubButtonCallback(InputBox and InputBox.Text or "")
                    end)
                end

                if InputBox then
                    allConnections[#allConnections + 1] = InputBox.FocusLost:Connect(function()
                        PanelFunc.Value = InputBox.Text
                        if configKey then
                            ConfigData[configKey] = InputBox.Text
                        end
                    end)
                end

                function PanelFunc:GetInput()
                    return InputBox and InputBox.Text or ""
                end

                CountItem = CountItem + 1
                return PanelFunc
            end

            function Items:AddButton(ButtonConfig)
                ButtonConfig = ButtonConfig or {}
                ButtonConfig.Title = ButtonConfig.Title or "Confirm"
                ButtonConfig.Callback = ButtonConfig.Callback or function() end
                ButtonConfig.SubTitle = ButtonConfig.SubTitle or nil
                ButtonConfig.SubCallback = ButtonConfig.SubCallback or function() end

                local Button = Instance.new("Frame")
                Button.BackgroundTransparency = 0.935
                Button.Size = UDim2.new(1, 0, 0, 40)
                Button.LayoutOrder = CountItem
                Button.Parent = SectionAdd

                local ButtonCorner = Instance.new("UICorner")
                ButtonCorner.CornerRadius = UDim.new(0, 4)
                ButtonCorner.Parent = Button

                local MainButton = Instance.new("TextButton")
                MainButton.Font = Enum.Font.GothamBold
                MainButton.Text = ButtonConfig.Title
                MainButton.TextSize = 12
                MainButton.TextTransparency = 0.3
                MainButton.TextColor3 = CACHE.Colors.White
                MainButton.BackgroundTransparency = 0.935
                MainButton.Size = ButtonConfig.SubTitle and UDim2.new(0.5, -8, 1, -10) or UDim2.new(1, -12, 1, -10)
                MainButton.Position = UDim2.new(0, 6, 0, 5)
                MainButton.Parent = Button

                local mainCorner = Instance.new("UICorner")
                mainCorner.CornerRadius = UDim.new(0, 4)
                mainCorner.Parent = MainButton

                allConnections[#allConnections + 1] = MainButton.MouseButton1Click:Connect(ButtonConfig.Callback)

                if ButtonConfig.SubTitle then
                    local SubButton = Instance.new("TextButton")
                    SubButton.Font = Enum.Font.GothamBold
                    SubButton.Text = ButtonConfig.SubTitle
                    SubButton.TextSize = 12
                    SubButton.TextTransparency = 0.3
                    SubButton.TextColor3 = CACHE.Colors.White
                    SubButton.BackgroundTransparency = 0.935
                    SubButton.Size = UDim2.new(0.5, -8, 1, -10)
                    SubButton.Position = UDim2.new(0.5, 2, 0, 5)
                    SubButton.Parent = Button

                    local subCorner = Instance.new("UICorner")
                    subCorner.CornerRadius = UDim.new(0, 4)
                    subCorner.Parent = SubButton

                    allConnections[#allConnections + 1] = SubButton.MouseButton1Click:Connect(ButtonConfig.SubCallback)
                end

                CountItem = CountItem + 1
                RegisterSearch({ label = ButtonConfig.Title, tab = TabConfig.Name, kind = "Button", switch = SearchSwitch })
            end

            function Items:AddToggle(ToggleConfig)
                ToggleConfig = ToggleConfig or {}
                ToggleConfig.Title = ToggleConfig.Title or "Title"
                ToggleConfig.Title2 = ToggleConfig.Title2 or ""
                ToggleConfig.Content = ToggleConfig.Content or ""
                ToggleConfig.Default = ToggleConfig.Default or false
                ToggleConfig.Callback = ToggleConfig.Callback or function() end

                local configKey = ShouldUseConfig(ToggleConfig) and ("Toggle_" .. ToggleConfig.Title) or nil
                if configKey and ConfigData[configKey] ~= nil then
                    ToggleConfig.Default = ConfigData[configKey]
                end

                local ToggleFunc = { Value = ToggleConfig.Default }

                local Toggle = Instance.new("Frame")
                Toggle.BackgroundTransparency = 0.935
                Toggle.LayoutOrder = CountItem
                Toggle.Name = "Toggle"
                Toggle.Parent = SectionAdd

                local ToggleCorner = Instance.new("UICorner")
                ToggleCorner.CornerRadius = UDim.new(0, 4)
                ToggleCorner.Parent = Toggle

                local ToggleTitle = Instance.new("TextLabel")
                ToggleTitle.Font = Enum.Font.GothamBold
                ToggleTitle.Text = ToggleConfig.Title
                ToggleTitle.TextSize = 13
                ToggleTitle.TextColor3 = CACHE.Colors.Gray230
                ToggleTitle.TextXAlignment = Enum.TextXAlignment.Left
                ToggleTitle.TextYAlignment = Enum.TextYAlignment.Top
                ToggleTitle.BackgroundTransparency = 1
                ToggleTitle.Position = UDim2.new(0, 10, 0, 10)
                ToggleTitle.Size = UDim2.new(1, -100, 0, 13)
                ToggleTitle.Name = "ToggleTitle"
                ToggleTitle.Parent = Toggle

                local ToggleTitle2 = Instance.new("TextLabel")
                ToggleTitle2.Font = Enum.Font.GothamBold
                ToggleTitle2.Text = ToggleConfig.Title2
                ToggleTitle2.TextSize = 12
                ToggleTitle2.TextColor3 = CACHE.Colors.Gray230
                ToggleTitle2.TextXAlignment = Enum.TextXAlignment.Left
                ToggleTitle2.TextYAlignment = Enum.TextYAlignment.Top
                ToggleTitle2.BackgroundTransparency = 1
                ToggleTitle2.Position = UDim2.new(0, 10, 0, 23)
                ToggleTitle2.Size = UDim2.new(1, -100, 0, 12)
                ToggleTitle2.Name = "ToggleTitle2"
                ToggleTitle2.Parent = Toggle

                local ToggleContent = Instance.new("TextLabel")
                ToggleContent.Font = Enum.Font.GothamBold
                ToggleContent.Text = ToggleConfig.Content
                ToggleContent.TextSize = 12
                ToggleContent.TextColor3 = CACHE.Colors.White
                ToggleContent.TextTransparency = 0.6
                ToggleContent.TextXAlignment = Enum.TextXAlignment.Left
                ToggleContent.TextYAlignment = Enum.TextYAlignment.Bottom
                ToggleContent.BackgroundTransparency = 1
                ToggleContent.Size = UDim2.new(1, -100, 0, 12)
                ToggleContent.TextWrapped = true
                ToggleContent.Name = "ToggleContent"
                ToggleContent.Parent = Toggle

                if ToggleConfig.Title2 ~= "" then
                    Toggle.Size = UDim2.new(1, 0, 0, 57)
                    ToggleContent.Position = UDim2.new(0, 10, 0, 36)
                    ToggleTitle2.Visible = true
                else
                    Toggle.Size = UDim2.new(1, 0, 0, 46)
                    ToggleContent.Position = UDim2.new(0, 10, 0, 23)
                    ToggleTitle2.Visible = false
                end

                local ToggleButton = Instance.new("TextButton")
                ToggleButton.BackgroundTransparency = 1
                ToggleButton.Size = UDim2.new(1, 0, 1, 0)
                ToggleButton.Name = "ToggleButton"
                ToggleButton.Parent = Toggle

                local FeatureFrame2 = Instance.new("Frame")
                FeatureFrame2.AnchorPoint = Vector2.new(1, 0.5)
                FeatureFrame2.BackgroundTransparency = 0.92
                FeatureFrame2.Position = UDim2.new(1, -15, 0.5, 0)
                FeatureFrame2.Size = UDim2.new(0, 30, 0, 15)
                FeatureFrame2.Name = "FeatureFrame"
                FeatureFrame2.Parent = Toggle

                local FeatureCorner = Instance.new("UICorner")
                FeatureCorner.CornerRadius = UDim.new(0, 4)
                FeatureCorner.Parent = FeatureFrame2

                local Stroke = Instance.new("UIStroke")
                Stroke.Color = CACHE.Colors.White
                Stroke.Thickness = 2
                Stroke.Transparency = 0.9
                Stroke.Parent = FeatureFrame2

                local ToggleCircle = Instance.new("Frame")
                ToggleCircle.BackgroundColor3 = CACHE.Colors.Gray230
                ToggleCircle.Size = UDim2.new(0, 14, 0, 14)
                ToggleCircle.Name = "ToggleCircle"
                ToggleCircle.Parent = FeatureFrame2

                local CircleCorner = Instance.new("UICorner")
                CircleCorner.CornerRadius = UDim.new(0, 15)
                CircleCorner.Parent = ToggleCircle

                -- PERFORMANCE: Pre-create tweens
                local tweenOn = {
                    { ToggleTitle, { TextColor3 = ConfigColor } },
                    { ToggleCircle, { Position = UDim2.new(0, 15, 0, 0) } },
                    { Stroke, { Color = ConfigColor, Transparency = 0 } },
                    { FeatureFrame2, { BackgroundColor3 = ConfigColor, BackgroundTransparency = 0 } },
                }
                local tweenOff = {
                    { ToggleTitle, { TextColor3 = CACHE.Colors.Gray230 } },
                    { ToggleCircle, { Position = UDim2.new(0, 0, 0, 0) } },
                    { Stroke, { Color = CACHE.Colors.White, Transparency = 0.9 } },
                    { FeatureFrame2, { BackgroundColor3 = CACHE.Colors.White, BackgroundTransparency = 0.92 } },
                }

                allConnections[#allConnections + 1] = ToggleButton.Activated:Connect(function()
                    ToggleFunc.Value = not ToggleFunc.Value
                    ToggleFunc:Set(ToggleFunc.Value)
                end)

                function ToggleFunc:Set(Value)
                    ToggleFunc.Value = Value
                    task.spawn(function()
                        if typeof(ToggleConfig.Callback) == "function" then
                            pcall(function() ToggleConfig.Callback(Value) end)
                        end
                    end)
                    if configKey then
                        ConfigData[configKey] = Value
                    end

                    local tweenInfo = CACHE.TweenInfo.Normal
                    if Value then
                        for _, t in ipairs(tweenOn) do
                            TweenService:Create(t[1], tweenInfo, t[2]):Play()
                        end
                    else
                        for _, t in ipairs(tweenOff) do
                            TweenService:Create(t[1], tweenInfo, t[2]):Play()
                        end
                    end
                end

                ToggleFunc:Set(ToggleFunc.Value)
                CountItem = CountItem + 1
                if configKey then
                    Elements[configKey] = ToggleFunc
                end
                RegisterSearch({ label = ToggleConfig.Title, tab = TabConfig.Name, kind = "Toggle", element = ToggleFunc, switch = SearchSwitch })
                return ToggleFunc
            end

            function Items:AddSlider(SliderConfig)
                SliderConfig = SliderConfig or {}
                SliderConfig.Title = SliderConfig.Title or "Slider"
                SliderConfig.Content = SliderConfig.Content or ""
                SliderConfig.Increment = SliderConfig.Increment or 1
                SliderConfig.Min = SliderConfig.Min or 0
                SliderConfig.Max = SliderConfig.Max or 100
                SliderConfig.Default = SliderConfig.Default or 50
                SliderConfig.Callback = SliderConfig.Callback or function() end

                local configKey = ShouldUseConfig(SliderConfig) and ("Slider_" .. SliderConfig.Title) or nil
                if configKey and ConfigData[configKey] ~= nil then
                    SliderConfig.Default = ConfigData[configKey]
                end

                local SliderFunc = { Value = SliderConfig.Default }

                local Slider = Instance.new("Frame")
                Slider.BackgroundTransparency = 0.935
                Slider.LayoutOrder = CountItem
                Slider.Size = UDim2.new(1, 0, 0, 46)
                Slider.Name = "Slider"
                Slider.Parent = SectionAdd

                local SliderCorner = Instance.new("UICorner")
                SliderCorner.CornerRadius = UDim.new(0, 4)
                SliderCorner.Parent = Slider

                local SliderTitle = Instance.new("TextLabel")
                SliderTitle.Font = Enum.Font.GothamBold
                SliderTitle.Text = SliderConfig.Title
                SliderTitle.TextColor3 = CACHE.Colors.Gray230
                SliderTitle.TextSize = 13
                SliderTitle.TextXAlignment = Enum.TextXAlignment.Left
                SliderTitle.TextYAlignment = Enum.TextYAlignment.Top
                SliderTitle.BackgroundTransparency = 1
                SliderTitle.Position = UDim2.new(0, 10, 0, 10)
                SliderTitle.Size = UDim2.new(1, -180, 0, 13)
                SliderTitle.Name = "SliderTitle"
                SliderTitle.Parent = Slider

                local SliderContent = Instance.new("TextLabel")
                SliderContent.Font = Enum.Font.GothamBold
                SliderContent.Text = SliderConfig.Content
                SliderContent.TextColor3 = CACHE.Colors.White
                SliderContent.TextSize = 12
                SliderContent.TextTransparency = 0.6
                SliderContent.TextXAlignment = Enum.TextXAlignment.Left
                SliderContent.TextYAlignment = Enum.TextYAlignment.Bottom
                SliderContent.BackgroundTransparency = 1
                SliderContent.TextWrapped = true
                SliderContent.Parent = Slider

                local SliderInput = Instance.new("Frame")
                SliderInput.AnchorPoint = Vector2.new(0, 0.5)
                SliderInput.BackgroundColor3 = ConfigColor
                SliderInput.Position = UDim2.new(1, -155, 0.5, 0)
                SliderInput.Size = UDim2.new(0, 28, 0, 20)
                SliderInput.Name = "SliderInput"
                SliderInput.Parent = Slider

                local InputCorner = Instance.new("UICorner")
                InputCorner.CornerRadius = UDim.new(0, 2)
                InputCorner.Parent = SliderInput

                local TextBox = Instance.new("TextBox")
                TextBox.Font = Enum.Font.GothamBold
                TextBox.Text = "90"
                TextBox.TextColor3 = CACHE.Colors.White
                TextBox.TextSize = 13
                TextBox.TextWrapped = true
                TextBox.BackgroundTransparency = 1
                TextBox.Position = UDim2.new(0, -1, 0, 0)
                TextBox.Size = UDim2.new(1, 0, 1, 0)
                TextBox.Parent = SliderInput

                local SliderFrame = Instance.new("Frame")
                SliderFrame.AnchorPoint = Vector2.new(1, 0.5)
                SliderFrame.BackgroundTransparency = 0.8
                SliderFrame.Position = UDim2.new(1, -20, 0.5, 0)
                SliderFrame.Size = UDim2.new(0, 100, 0, 3)
                SliderFrame.Name = "SliderFrame"
                SliderFrame.Parent = Slider

                local FrameCorner = Instance.new("UICorner")
                FrameCorner.Parent = SliderFrame

                local SliderDraggable = Instance.new("Frame")
                SliderDraggable.AnchorPoint = Vector2.new(0, 0.5)
                SliderDraggable.BackgroundColor3 = ConfigColor
                SliderDraggable.Position = UDim2.new(0, 0, 0.5, 0)
                SliderDraggable.Size = UDim2.new(0.9, 0, 0, 1)
                SliderDraggable.Name = "SliderDraggable"
                SliderDraggable.Parent = SliderFrame

                local DraggableCorner = Instance.new("UICorner")
                DraggableCorner.Parent = SliderDraggable

                local SliderCircle = Instance.new("Frame")
                SliderCircle.AnchorPoint = Vector2.new(1, 0.5)
                SliderCircle.BackgroundColor3 = ConfigColor
                SliderCircle.Position = UDim2.new(1, 4, 0.5, 0)
                SliderCircle.Size = UDim2.new(0, 8, 0, 8)
                SliderCircle.Name = "SliderCircle"
                SliderCircle.Parent = SliderDraggable

                local CircleCorner = Instance.new("UICorner")
                CircleCorner.Parent = SliderCircle

                local CircleStroke = Instance.new("UIStroke")
                CircleStroke.Color = ConfigColor
                CircleStroke.Parent = SliderCircle

                local Dragging = false

                local function CountDecimals(n)
                    local s = string.format("%.10f", n):gsub("0+$", ""):gsub("%.$", "")
                    local dot = s:find("%.")
                    return dot and (#s - dot) or 0
                end

                local Decimals = CountDecimals(SliderConfig.Increment)
                local function Round(Number, Factor)
                    local Result = math.floor(Number / Factor + 0.5) * Factor
                    local mult = 10 ^ Decimals
                    return math.floor(Result * mult + 0.5) / mult
                end

                function SliderFunc:Set(Value)
                    Value = math.clamp(Round(Value, SliderConfig.Increment), SliderConfig.Min, SliderConfig.Max)
                    SliderFunc.Value = Value
                    TextBox.Text = string.format("%." .. Decimals .. "f", Value)
                    TweenService:Create(SliderDraggable, CACHE.TweenInfo.Normal, {
                        Size = UDim2.fromScale((Value - SliderConfig.Min) / (SliderConfig.Max - SliderConfig.Min), 1)
                    }):Play()
                    SliderConfig.Callback(Value)
                    if configKey then
                        ConfigData[configKey] = Value
                    end
                end

                allConnections[#allConnections + 1] = SliderFrame.InputBegan:Connect(function(Input)
                    if Input.UserInputType == Enum.UserInputType.MouseButton1 or Input.UserInputType == Enum.UserInputType.Touch then
                        Dragging = true
                        TweenService:Create(SliderCircle, CACHE.TweenInfo.CircleFast, { Size = UDim2.new(0, 14, 0, 14) }):Play()
                        local SizeScale = math.clamp(
                            (Input.Position.X - SliderFrame.AbsolutePosition.X) / SliderFrame.AbsoluteSize.X,
                            0, 1
                        )
                        SliderFunc:Set(SliderConfig.Min + ((SliderConfig.Max - SliderConfig.Min) * SizeScale))
                    end
                end)

                allConnections[#allConnections + 1] = SliderFrame.InputEnded:Connect(function(Input)
                    if Input.UserInputType == Enum.UserInputType.MouseButton1 or Input.UserInputType == Enum.UserInputType.Touch then
                        Dragging = false
                        SliderConfig.Callback(SliderFunc.Value)
                        TweenService:Create(SliderCircle, CACHE.TweenInfo.CircleFast, { Size = UDim2.new(0, 8, 0, 8) }):Play()
                    end
                end)

                local lastX = nil
                allConnections[#allConnections + 1] = UserInputService.InputChanged:Connect(function(Input)
                    if Dragging and (Input.UserInputType == Enum.UserInputType.MouseMovement or Input.UserInputType == Enum.UserInputType.Touch) then
                        local CurrPosX = Input.Position.X
                        if CurrPosX ~= lastX then
                            lastX = CurrPosX
                            local SizeScale = math.clamp(
                                (CurrPosX - SliderFrame.AbsolutePosition.X) / SliderFrame.AbsoluteSize.X,
                                0, 1
                            )
                            SliderFunc:Set(SliderConfig.Min + ((SliderConfig.Max - SliderConfig.Min) * SizeScale))
                        end
                    end
                end)

                allConnections[#allConnections + 1] = TextBox.FocusLost:Connect(function()
                    local Valid = TextBox.Text:gsub("[^%d%.]", "")
                    local ValidNumber = tonumber(Valid)
                    if ValidNumber then
                        SliderFunc:Set(math.clamp(ValidNumber, SliderConfig.Min, SliderConfig.Max))
                    else
                        SliderFunc:Set(SliderConfig.Min)
                    end
                end)

                SliderFunc:Set(SliderConfig.Default)
                CountItem = CountItem + 1
                if configKey then
                    Elements[configKey] = SliderFunc
                end
                RegisterSearch({ label = SliderConfig.Title, tab = TabConfig.Name, kind = "Slider", element = SliderFunc, switch = SearchSwitch })
                return SliderFunc
            end

            function Items:AddInput(InputConfig)
                InputConfig = InputConfig or {}
                InputConfig.Title = InputConfig.Title or "Title"
                InputConfig.Content = InputConfig.Content or ""
                InputConfig.Callback = InputConfig.Callback or function() end
                InputConfig.Default = InputConfig.Default or ""
                InputConfig.Placeholder = InputConfig.Placeholder or "Input Here"

                local configKey = ShouldUseConfig(InputConfig) and ("Input_" .. InputConfig.Title) or nil
                if configKey and ConfigData[configKey] ~= nil then
                    InputConfig.Default = ConfigData[configKey]
                end

                local InputFunc = { Value = InputConfig.Default }

                local Input = Instance.new("Frame")
                Input.BackgroundTransparency = 0.935
                Input.LayoutOrder = CountItem
                Input.Size = UDim2.new(1, 0, 0, 46)
                Input.Name = "Input"
                Input.Parent = SectionAdd

                local InputCorner = Instance.new("UICorner")
                InputCorner.CornerRadius = UDim.new(0, 4)
                InputCorner.Parent = Input

                local InputTitle = Instance.new("TextLabel")
                InputTitle.Font = Enum.Font.GothamBold
                InputTitle.Text = InputConfig.Title
                InputTitle.TextColor3 = CACHE.Colors.Gray230
                InputTitle.TextSize = 13
                InputTitle.TextXAlignment = Enum.TextXAlignment.Left
                InputTitle.TextYAlignment = Enum.TextYAlignment.Top
                InputTitle.BackgroundTransparency = 1
                InputTitle.Position = UDim2.new(0, 10, 0, 10)
                InputTitle.Size = UDim2.new(1, -180, 0, 13)
                InputTitle.Name = "InputTitle"
                InputTitle.Parent = Input

                local InputContent = Instance.new("TextLabel")
                InputContent.Font = Enum.Font.GothamBold
                InputContent.Text = InputConfig.Content
                InputContent.TextColor3 = CACHE.Colors.White
                InputContent.TextSize = 12
                InputContent.TextTransparency = 0.6
                InputContent.TextWrapped = true
                InputContent.TextXAlignment = Enum.TextXAlignment.Left
                InputContent.TextYAlignment = Enum.TextYAlignment.Bottom
                InputContent.BackgroundTransparency = 1
                InputContent.Parent = Input

                local InputFrame = Instance.new("Frame")
                InputFrame.AnchorPoint = Vector2.new(1, 0.5)
                InputFrame.BackgroundTransparency = 0.95
                InputFrame.Position = UDim2.new(1, -7, 0.5, 0)
                InputFrame.Size = UDim2.new(0, 148, 0, 30)
                InputFrame.ClipsDescendants = true
                InputFrame.Name = "InputFrame"
                InputFrame.Parent = Input

                local FrameCorner = Instance.new("UICorner")
                FrameCorner.CornerRadius = UDim.new(0, 4)
                FrameCorner.Parent = InputFrame

                local InputTextBox = Instance.new("TextBox")
                InputTextBox.CursorPosition = -1
                InputTextBox.Font = Enum.Font.GothamBold
                InputTextBox.PlaceholderText = InputConfig.Placeholder
                InputTextBox.PlaceholderColor3 = Color3.fromRGB(120, 120, 120)
                InputTextBox.Text = InputConfig.Default
                InputTextBox.TextColor3 = CACHE.Colors.White
                InputTextBox.TextSize = 12
                InputTextBox.TextXAlignment = Enum.TextXAlignment.Left
                InputTextBox.BackgroundTransparency = 1
                InputTextBox.Position = UDim2.new(0, 5, 0.5, 0)
                InputTextBox.Size = UDim2.new(1, -10, 1, -8)
                InputTextBox.Name = "InputTextBox"
                InputTextBox.Parent = InputFrame

                function InputFunc:Set(Value)
                    InputTextBox.Text = Value
                    InputFunc.Value = Value
                    InputConfig.Callback(Value)
                    if configKey then
                        ConfigData[configKey] = Value
                    end
                end

                function InputFunc:Get()
                    return InputTextBox.Text
                end

                InputFunc:Set(InputFunc.Value)

                allConnections[#allConnections + 1] = InputTextBox.FocusLost:Connect(function()
                    InputFunc:Set(InputTextBox.Text)
                end)

                CountItem = CountItem + 1
                if configKey then
                    Elements[configKey] = InputFunc
                end
                RegisterSearch({ label = InputConfig.Title, tab = TabConfig.Name, kind = "Input", element = InputFunc, switch = SearchSwitch })
                return InputFunc
            end

            function Items:AddDropdown(DropdownConfig)
                DropdownConfig = DropdownConfig or {}
                DropdownConfig.Title = DropdownConfig.Title or "Title"
                DropdownConfig.Content = DropdownConfig.Content or ""
                DropdownConfig.Multi = DropdownConfig.Multi or false
                DropdownConfig.Options = DropdownConfig.Options or {}
                DropdownConfig.Default = DropdownConfig.Default or (DropdownConfig.Multi and {} or nil)
                DropdownConfig.Callback = DropdownConfig.Callback or function() end

                local configKey = ShouldUseConfig(DropdownConfig) and ("Dropdown_" .. DropdownConfig.Title) or nil
                if configKey and ConfigData[configKey] ~= nil then
                    DropdownConfig.Default = ConfigData[configKey]
                end

                local DropdownFunc = { Value = DropdownConfig.Default, Options = DropdownConfig.Options }

                local Dropdown = Instance.new("Frame")
                Dropdown.BackgroundTransparency = 0.935
                Dropdown.LayoutOrder = CountItem
                Dropdown.Size = UDim2.new(1, 0, 0, 46)
                Dropdown.Name = "Dropdown"
                Dropdown.Parent = SectionAdd

                local DropdownButton = Instance.new("TextButton")
                DropdownButton.BackgroundTransparency = 1
                DropdownButton.Size = UDim2.new(1, 0, 1, 0)
                DropdownButton.Name = "ToggleButton"
                DropdownButton.Parent = Dropdown

                local DropdownCorner = Instance.new("UICorner")
                DropdownCorner.CornerRadius = UDim.new(0, 4)
                DropdownCorner.Parent = Dropdown

                local DropdownTitle = Instance.new("TextLabel")
                DropdownTitle.Font = Enum.Font.GothamBold
                DropdownTitle.Text = DropdownConfig.Title
                DropdownTitle.TextColor3 = CACHE.Colors.Gray230
                DropdownTitle.TextSize = 13
                DropdownTitle.TextXAlignment = Enum.TextXAlignment.Left
                DropdownTitle.TextYAlignment = Enum.TextYAlignment.Top
                DropdownTitle.BackgroundTransparency = 1
                DropdownTitle.Position = UDim2.new(0, 10, 0, 10)
                DropdownTitle.Size = UDim2.new(1, -180, 0, 13)
                DropdownTitle.Name = "DropdownTitle"
                DropdownTitle.Parent = Dropdown

                local DropdownContent = Instance.new("TextLabel")
                DropdownContent.Font = Enum.Font.GothamBold
                DropdownContent.Text = DropdownConfig.Content
                DropdownContent.TextColor3 = CACHE.Colors.White
                DropdownContent.TextSize = 12
                DropdownContent.TextTransparency = 0.6
                DropdownContent.TextWrapped = true
                DropdownContent.TextXAlignment = Enum.TextXAlignment.Left
                DropdownContent.TextYAlignment = Enum.TextYAlignment.Bottom
                DropdownContent.BackgroundTransparency = 1
                DropdownContent.Parent = Dropdown

                local SelectOptionsFrame = Instance.new("Frame")
                SelectOptionsFrame.AnchorPoint = Vector2.new(1, 0.5)
                SelectOptionsFrame.BackgroundTransparency = 0.95
                SelectOptionsFrame.Position = UDim2.new(1, -7, 0.5, 0)
                SelectOptionsFrame.Size = UDim2.new(0, 148, 0, 30)
                SelectOptionsFrame.Name = "SelectOptionsFrame"
                SelectOptionsFrame.LayoutOrder = CountDropdown
                SelectOptionsFrame.Parent = Dropdown

                local SelectCorner = Instance.new("UICorner")
                SelectCorner.CornerRadius = UDim.new(0, 4)
                SelectCorner.Parent = SelectOptionsFrame

                allConnections[#allConnections + 1] = DropdownButton.Activated:Connect(function()
                    local wasHidden = not MoreBlur.Visible
                    MoreBlur.Visible = true
                    DropPageLayout:JumpToIndex(SelectOptionsFrame.LayoutOrder)
                    if wasHidden then
                        TweenService:Create(MoreBlur, CACHE.TweenInfo.Slow, { BackgroundTransparency = 0.7 }):Play()
                        TweenService:Create(DropdownSelect, CACHE.TweenInfo.Slow, { Position = UDim2.new(1, -11, 0.5, 0) }):Play()
                    end
                    if SearchBox then
                        SearchBox.Text = ""
                        task.defer(function()
                            SearchBox:CaptureFocus()
                        end)
                    end
                end)

                local OptionSelecting = Instance.new("TextLabel")
                OptionSelecting.Font = Enum.Font.GothamBold
                OptionSelecting.Text = DropdownConfig.Multi and "Select Options" or "Select Option"
                OptionSelecting.TextColor3 = CACHE.Colors.White
                OptionSelecting.TextSize = 12
                OptionSelecting.TextTransparency = 0.6
                OptionSelecting.TextXAlignment = Enum.TextXAlignment.Left
                OptionSelecting.AnchorPoint = Vector2.new(0, 0.5)
                OptionSelecting.BackgroundTransparency = 1
                OptionSelecting.Position = UDim2.new(0, 5, 0.5, 0)
                OptionSelecting.Size = UDim2.new(1, -30, 1, -8)
                OptionSelecting.Name = "OptionSelecting"
                OptionSelecting.Parent = SelectOptionsFrame

                local OptionImg = Instance.new("ImageLabel")
                OptionImg.Image = "rbxassetid://16851841101"
                OptionImg.ImageColor3 = CACHE.Colors.Gray230
                OptionImg.AnchorPoint = Vector2.new(1, 0.5)
                OptionImg.BackgroundTransparency = 1
                OptionImg.Position = UDim2.new(1, 0, 0.5, 0)
                OptionImg.Size = UDim2.new(0, 25, 0, 25)
                OptionImg.Name = "OptionImg"
                OptionImg.Parent = SelectOptionsFrame

                local DropdownContainer = Instance.new("Frame")
                DropdownContainer.Size = UDim2.new(1, 0, 1, 0)
                DropdownContainer.BackgroundTransparency = 1
                DropdownContainer.Parent = DropdownFolder

                local SearchBox = Instance.new("TextBox")
                SearchBox.PlaceholderText = "Search"
                SearchBox.Font = Enum.Font.Gotham
                SearchBox.Text = ""
                SearchBox.TextSize = 12
                SearchBox.TextColor3 = CACHE.Colors.White
                SearchBox.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
                SearchBox.BackgroundTransparency = 0.9
                SearchBox.Size = UDim2.new(1, 0, 0, 25)
                SearchBox.Position = UDim2.new(0, 0, 0, 0)
                SearchBox.ClearTextOnFocus = false
                SearchBox.Name = "SearchBox"
                SearchBox.Parent = DropdownContainer

                local ScrollSelect = Instance.new("ScrollingFrame")
                ScrollSelect.Size = UDim2.new(1, 0, 1, -30)
                ScrollSelect.Position = UDim2.new(0, 0, 0, 30)
                ScrollSelect.ScrollBarImageTransparency = 1
                ScrollSelect.BackgroundTransparency = 1
                ScrollSelect.ScrollBarThickness = 0
                ScrollSelect.CanvasSize = UDim2.new(0, 0, 0, 0)
                ScrollSelect.Name = "ScrollSelect"
                ScrollSelect.Parent = DropdownContainer

                local ScrollLayout = Instance.new("UIListLayout")
                ScrollLayout.Padding = UDim.new(0, 3)
                ScrollLayout.SortOrder = Enum.SortOrder.LayoutOrder
                ScrollLayout.Parent = ScrollSelect

                allConnections[#allConnections + 1] = ScrollLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
                    pcall(function()
                        ScrollSelect.CanvasSize = UDim2.new(0, 0, 0, ScrollLayout.AbsoluteContentSize.Y)
                    end)
                end)

                allConnections[#allConnections + 1] = SearchBox:GetPropertyChangedSignal("Text"):Connect(function()
                    local query = string.lower(SearchBox.Text)
                    pcall(function()
                        for _, option in pairs(ScrollSelect:GetChildren()) do
                            if option.Name == "Option" and option:FindFirstChild("OptionText") then
                                local text = string.lower(option.OptionText.Text)
                                option.Visible = query == "" or string.find(text, query, 1, true)
                            end
                        end
                        ScrollSelect.CanvasSize = UDim2.new(0, 0, 0, ScrollLayout.AbsoluteContentSize.Y)
                    end)
                end)

                local DropCount = 0

                function DropdownFunc:Clear()
                    pcall(function()
                        for _, DropFrame in ScrollSelect:GetChildren() do
                            if DropFrame.Name == "Option" then
                                DropFrame:Destroy()
                            end
                        end
                    end)
                    DropdownFunc.Value = DropdownConfig.Multi and {} or nil
                    DropdownFunc.Options = {}
                    OptionSelecting.Text = DropdownConfig.Multi and "Select Options" or "Select Option"
                    DropCount = 0
                end

                function DropdownFunc:AddOption(option)
                    local label, value
                    if typeof(option) == "table" and option.Label and option.Value ~= nil then
                        label = tostring(option.Label)
                        value = option.Value
                    else
                        label = tostring(option)
                        value = option
                    end

                    local Option = Instance.new("Frame")
                    Option.BackgroundTransparency = 1
                    Option.Size = UDim2.new(1, 0, 0, 30)
                    Option.Name = "Option"
                    Option.Parent = ScrollSelect

                    local OptionCorner = Instance.new("UICorner")
                    OptionCorner.CornerRadius = UDim.new(0, 3)
                    OptionCorner.Parent = Option

                    local OptionButton = Instance.new("TextButton")
                    OptionButton.BackgroundTransparency = 1
                    OptionButton.Size = UDim2.new(1, 0, 1, 0)
                    OptionButton.Text = ""
                    OptionButton.Name = "OptionButton"
                    OptionButton.Parent = Option

                    local OptionText = Instance.new("TextLabel")
                    OptionText.Font = Enum.Font.GothamBold
                    OptionText.Text = label
                    OptionText.TextSize = 13
                    OptionText.TextColor3 = CACHE.Colors.Gray230
                    OptionText.Position = UDim2.new(0, 8, 0, 8)
                    OptionText.Size = UDim2.new(1, -100, 0, 13)
                    OptionText.BackgroundTransparency = 1
                    OptionText.TextXAlignment = Enum.TextXAlignment.Left
                    OptionText.Name = "OptionText"
                    OptionText.Parent = Option

                    Option:SetAttribute("RealValue", value)
                    Option:SetAttribute("Selected", false)

                    local ChooseFrame = Instance.new("Frame")
                    ChooseFrame.AnchorPoint = Vector2.new(0, 0.5)
                    ChooseFrame.BackgroundColor3 = ConfigColor
                    ChooseFrame.Position = UDim2.new(0, 2, 0.5, 0)
                    ChooseFrame.Size = UDim2.new(0, 0, 0, 0)
                    ChooseFrame.Name = "ChooseFrame"
                    ChooseFrame.Parent = Option

                    local ChooseStroke = Instance.new("UIStroke")
                    ChooseStroke.Color = ConfigColor
                    ChooseStroke.Thickness = 1.6
                    ChooseStroke.Transparency = 0.999
                    ChooseStroke.Parent = ChooseFrame

                    local ChooseCorner = Instance.new("UICorner")
                    ChooseCorner.Parent = ChooseFrame

                    allConnections[#allConnections + 1] = OptionButton.Activated:Connect(function()
                        if DropdownConfig.Multi then
                            if not table.find(DropdownFunc.Value, value) then
                                table.insert(DropdownFunc.Value, value)
                            else
                                for i, v in pairs(DropdownFunc.Value) do
                                    if v == value then
                                        table.remove(DropdownFunc.Value, i)
                                        break
                                    end
                                end
                            end
                        else
                            DropdownFunc.Value = value
                        end
                        DropdownFunc:Set(DropdownFunc.Value)
                    end)

                    DropCount = DropCount + 1
                end

                function DropdownFunc:Set(Value)
                    task.spawn(function()
                        if DropdownConfig.Multi then
                            DropdownFunc.Value = type(Value) == "table" and Value or {}
                        else
                            DropdownFunc.Value = (type(Value) == "table" and Value[1]) or Value
                        end

                        if configKey then
                            ConfigData[configKey] = DropdownFunc.Value
                        end

                        local texts = {}
                        for _, Drop in ScrollSelect:GetChildren() do
                            if Drop.Name == "Option" and Drop:FindFirstChild("OptionText") then
                                local v = Drop:GetAttribute("RealValue")
                                local selected = DropdownConfig.Multi and table.find(DropdownFunc.Value, v) or
                                    DropdownFunc.Value == v
                                selected = selected ~= nil and selected ~= false
                                local wasSelected = Drop:GetAttribute("Selected") == true

                                if selected ~= wasSelected then
                                    Drop:SetAttribute("Selected", selected)
                                    local tweenInfo = selected and CACHE.TweenInfo.Normal or CACHE.TweenInfo.Fast
                                    if selected then
                                        TweenService:Create(Drop.ChooseFrame, tweenInfo, { Size = UDim2.new(0, 1, 0, 12) }):Play()
                                        TweenService:Create(Drop.ChooseFrame.UIStroke, tweenInfo, { Transparency = 0 }):Play()
                                        TweenService:Create(Drop, tweenInfo, { BackgroundTransparency = 0.935 }):Play()
                                    else
                                        TweenService:Create(Drop.ChooseFrame, tweenInfo, { Size = UDim2.new(0, 0, 0, 0) }):Play()
                                        TweenService:Create(Drop.ChooseFrame.UIStroke, tweenInfo, { Transparency = 0.999 }):Play()
                                        TweenService:Create(Drop, tweenInfo, { BackgroundTransparency = 1 }):Play()
                                    end
                                end

                                if selected then
                                    texts[#texts + 1] = Drop.OptionText.Text
                                end
                            end
                        end

                        OptionSelecting.Text = (#texts == 0)
                            and (DropdownConfig.Multi and "Select Options" or "Select Option")
                            or table.concat(texts, ", ")

                        if DropdownConfig.Callback then
                            if DropdownConfig.Multi then
                                DropdownConfig.Callback(DropdownFunc.Value)
                            else
                                local str = (DropdownFunc.Value ~= nil) and tostring(DropdownFunc.Value) or ""
                                DropdownConfig.Callback(str)
                            end
                        end
                    end)
                end

                function DropdownFunc:SetValue(val)
                    self:Set(val)
                end

                function DropdownFunc:GetValue()
                    return self.Value
                end

                function DropdownFunc:SetValues(newList, selecting)
                    newList = newList or {}
                    selecting = selecting or (DropdownConfig.Multi and {} or nil)
                    DropdownFunc:Clear()
                    task.spawn(function()
                        for i, v in ipairs(newList) do
                            DropdownFunc:AddOption(v)
                            if i % 20 == 0 then
                                task.wait()
                            end
                        end
                        DropdownFunc:Set(selecting)
                    end)
                    DropdownFunc.Options = newList
                end

                DropdownFunc:SetValues(DropdownFunc.Options, DropdownFunc.Value)

                CountItem = CountItem + 1
                CountDropdown = CountDropdown + 1
                if configKey then
                    Elements[configKey] = DropdownFunc
                end
                RegisterSearch({ label = DropdownConfig.Title, tab = TabConfig.Name, kind = "Dropdown", element = DropdownFunc, switch = SearchSwitch })
                return DropdownFunc
            end

            function Items:AddConfig(ConfigCfg)
                ConfigCfg = ConfigCfg or {}

                local currentName = ""
                local selectedConfig = nil
                local autoName = GuiFunc:GetAutoLoad()
                if autoName ~= "" then
                    currentName = autoName
                    selectedConfig = autoName
                end

                local NameInput = Items:AddInput({
                    Title = "Config Name",
                    Content = "Name for saving",
                    Placeholder = "MyConfig",
                    Default = currentName,
                    NoConfig = true,
                    Callback = function(text) currentName = text end,
                })

                local ConfigList
                local AutoLoadToggle
                local JsonInput
                local jsonText = ""

                local function RefreshList()
                    local list = GuiFunc:GetConfigs()
                    if ConfigList and ConfigList.SetValues then
                        ConfigList:SetValues(list, selectedConfig)
                    end
                end

                local function ResolveName()
                    local live = (NameInput and NameInput.Get and NameInput:Get()) or currentName or ""
                    if live ~= "" then currentName = live end
                    return live
                end

                ConfigList = Items:AddDropdown({
                    Title = "Saved Configs",
                    Content = "Select a config",
                    Multi = false,
                    Options = GuiFunc:GetConfigs(),
                    Default = selectedConfig,
                    NoConfig = true,
                    Callback = function(choice)
                        selectedConfig = choice
                        if choice and choice ~= "" then
                            currentName = choice
                            if NameInput and NameInput.Set then
                                NameInput:Set(choice)
                            end
                        end
                    end,
                })

                local function DoSave()
                    local targetName = ResolveName()
                    if targetName == "" then targetName = selectedConfig or "" end
                    local ok, savedName = GuiFunc:SaveConfigAs(targetName)
                    if ok then
                        selectedConfig = savedName or targetName
                        if NameInput and NameInput.Set then
                            NameInput:Set(selectedConfig)
                        end
                        RefreshList()
                    end
                    return ok
                end

                Items:AddButton({
                    Title = "Save",
                    SubTitle = "Save As",
                    Callback = DoSave,
                    SubCallback = DoSave,
                })

                Items:AddButton({
                    Title = "Load",
                    SubTitle = "Delete",
                    Callback = function()
                        if selectedConfig then GuiFunc:LoadConfigByName(selectedConfig) end
                    end,
                    SubCallback = function()
                        if selectedConfig then
                            GuiFunc:DeleteConfig(selectedConfig)
                            selectedConfig = nil
                            RefreshList()
                        end
                    end,
                })

                local autoToggleReady = false
                AutoLoadToggle = Items:AddToggle({
                    Title = "Auto Load",
                    Content = autoName ~= "" and ("Auto: " .. autoName) or "Load selected on startup",
                    Default = autoName ~= "",
                    NoConfig = true,
                    Callback = function(value)
                        if not autoToggleReady then return end
                        if value then
                            local name = selectedConfig
                            if not name or name == "" then name = ResolveName() end
                            if not name or name == "" then
                                GuiFunc:SetAutoLoad("", false)
                                than("Enter a config name first", 4, CACHE.Colors.Orange255, "WisHub", "Config")
                                if AutoLoadToggle then
                                    task.defer(function() AutoLoadToggle:Set(false) end)
                                end
                                return
                            end
                            if not (isfile and isfile(GetConfigPath(name))) then
                                if not GuiFunc:SaveConfigAs(name) then
                                    if AutoLoadToggle then
                                        task.defer(function() AutoLoadToggle:Set(false) end)
                                    end
                                    return
                                end
                                RefreshList()
                            end
                            selectedConfig = name
                            GuiFunc:SetAutoLoad(name, true)
                            than("Auto load set to '" .. name .. "'", 4, ConfigColor, "WisHub", "Config")
                        else
                            GuiFunc:SetAutoLoad("", false)
                        end
                    end,
                })
                autoToggleReady = true

                JsonInput = Items:AddInput({
                    Title = "Config JSON",
                    Content = "Paste JSON for import or export",
                    Placeholder = "{\"Data\":{}}",
                    NoConfig = true,
                    Callback = function(text) jsonText = text end,
                })

                Items:AddButton({
                    Title = "Export JSON",
                    SubTitle = "Import JSON",
                    Callback = function()
                        local payload = GuiFunc:ExportConfig()
                        jsonText = payload
                        if JsonInput and JsonInput.Set then
                            JsonInput:Set(payload)
                        end
                    end,
                    SubCallback = function()
                        local input = jsonText
                        if (not input or input == "") and getclipboard then
                            input = getclipboard()
                        end
                        GuiFunc:ImportConfig(input)
                    end,
                })

                return { Refresh = RefreshList }
            end

            function Items:AddBanner(BannerConfig)
                BannerConfig = BannerConfig or {}
                local asset = tostring(BannerConfig.Image or BannerConfig.Banner or "")
                if asset ~= "" and not string.find(asset, "rbxassetid://") then
                    asset = "rbxassetid://" .. asset
                end

                local ratio = BannerConfig.AspectRatio or (16 / 5)

                local Banner = Instance.new("Frame")
                Banner.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
                Banner.BackgroundTransparency = 0.2
                Banner.ClipsDescendants = true
                Banner.LayoutOrder = CountItem
                Banner.Size = UDim2.new(1, 0, 0, 110)
                Banner.Name = "Banner"
                Banner.Parent = SectionAdd

                local BannerCorner = Instance.new("UICorner")
                BannerCorner.CornerRadius = UDim.new(0, 8)
                BannerCorner.Parent = Banner

                local function FitHeight()
                    pcall(function()
                        local w = Banner.AbsoluteSize.X
                        if w > 0 then
                            local h = math.floor(w / ratio)
                            if math.abs(Banner.Size.Y.Offset - h) > 1 then
                                Banner.Size = UDim2.new(1, 0, 0, h)
                                pcall(UpdateSizeSection)
                            end
                        end
                    end)
                end

                if asset ~= "" then
                    pcall(function()
                        local Img = Instance.new("ImageLabel")
                        Img.Image = asset
                        Img.BackgroundTransparency = 1
                        Img.ScaleType = Enum.ScaleType.Crop
                        Img.Size = UDim2.new(1, 0, 1, 0)
                        Img.Name = "BannerImage"
                        Img.Parent = Banner
                    end)
                else
                    pcall(function()
                        local Grad = Instance.new("UIGradient")
                        Grad.Color = ColorSequence.new {
                            ColorSequenceKeypoint.new(0, CACHE.Colors.Gray20),
                            ColorSequenceKeypoint.new(0.5, ConfigColor),
                            ColorSequenceKeypoint.new(1, CACHE.Colors.Gray20)
                        }
                        Grad.Rotation = 25
                        Grad.Parent = Banner
                    end)
                end

                if BannerConfig.Version then
                    local VerPill = Instance.new("Frame")
                    VerPill.BackgroundColor3 = CACHE.Colors.Black
                    VerPill.BackgroundTransparency = 0.35
                    VerPill.AnchorPoint = Vector2.new(1, 0)
                    VerPill.Position = UDim2.new(1, -8, 0, 8)
                    VerPill.Size = UDim2.new(0, 52, 0, 20)
                    VerPill.ZIndex = 3
                    VerPill.Name = "VersionPill"
                    VerPill.Parent = Banner

                    local VerCorner = Instance.new("UICorner")
                    VerCorner.CornerRadius = UDim.new(0, 10)
                    VerCorner.Parent = VerPill

                    local VerLabel = Instance.new("TextLabel")
                    VerLabel.Font = Enum.Font.GothamBold
                    VerLabel.Text = tostring(BannerConfig.Version)
                    VerLabel.TextColor3 = CACHE.Colors.White
                    VerLabel.TextSize = 10
                    VerLabel.BackgroundTransparency = 1
                    VerLabel.Size = UDim2.new(1, 0, 1, 0)
                    VerLabel.ZIndex = 4
                    VerLabel.Parent = VerPill
                end

                allConnections[#allConnections + 1] = Banner:GetPropertyChangedSignal("AbsoluteSize"):Connect(FitHeight)
                task.spawn(function()
                    task.wait()
                    FitHeight()
                end)

                CountItem = CountItem + 1
                return Banner
            end

            function Items:AddCard(CardConfig)
                CardConfig = CardConfig or {}
                CardConfig.Title = CardConfig.Title or "Card"
                CardConfig.Description = CardConfig.Description or ""
                local btns = CardConfig.Buttons or {}
                local cardHeight = 70 + (#btns > 0 and 40 or 0)

                local Card = Instance.new("Frame")
                Card.BackgroundTransparency = 0.935
                Card.LayoutOrder = CountItem
                Card.Size = UDim2.new(1, 0, 0, cardHeight)
                Card.Name = "Card"
                Card.Parent = SectionAdd

                local CardCorner = Instance.new("UICorner")
                CardCorner.CornerRadius = UDim.new(0, 6)
                CardCorner.Parent = Card

                local cx = 12
                if CardConfig.Logo and CardConfig.Logo ~= "" then
                    local logo = tostring(CardConfig.Logo)
                    if not string.find(logo, "rbxassetid://") then logo = "rbxassetid://" .. logo end
                    local Logo = Instance.new("ImageLabel")
                    Logo.Image = logo
                    Logo.BackgroundTransparency = 1
                    Logo.ScaleType = Enum.ScaleType.Fit
                    Logo.Position = UDim2.new(0, 12, 0, 14)
                    Logo.Size = UDim2.new(0, 32, 0, 32)
                    Logo.Parent = Card
                    cx = 52
                end

                local CardTitle = Instance.new("TextLabel")
                CardTitle.Font = Enum.Font.GothamBold
                CardTitle.Text = CardConfig.Title
                CardTitle.TextColor3 = Color3.fromRGB(235, 235, 235)
                CardTitle.TextSize = 13
                CardTitle.TextXAlignment = Enum.TextXAlignment.Left
                CardTitle.BackgroundTransparency = 1
                CardTitle.Position = UDim2.new(0, cx, 0, 12)
                CardTitle.Size = UDim2.new(1, -cx - 12, 0, 16)
                CardTitle.Parent = Card

                local CardDesc = Instance.new("TextLabel")
                CardDesc.Font = Enum.Font.Gotham
                CardDesc.Text = CardConfig.Description
                CardDesc.TextColor3 = CACHE.Colors.Gray180
                CardDesc.TextSize = 11
                CardDesc.TextXAlignment = Enum.TextXAlignment.Left
                CardDesc.TextYAlignment = Enum.TextYAlignment.Top
                CardDesc.TextWrapped = true
                CardDesc.BackgroundTransparency = 1
                CardDesc.Position = UDim2.new(0, cx, 0, 30)
                CardDesc.Size = UDim2.new(1, -cx - 12, 0, 28)
                CardDesc.Parent = Card

                if #btns > 0 then
                    local Row = Instance.new("Frame")
                    Row.BackgroundTransparency = 1
                    Row.Position = UDim2.new(0, 8, 0, cardHeight - 38)
                    Row.Size = UDim2.new(1, -16, 0, 30)
                    Row.Parent = Card

                    local RowLayout = Instance.new("UIListLayout")
                    RowLayout.FillDirection = Enum.FillDirection.Horizontal
                    RowLayout.Padding = UDim.new(0, 6)
                    RowLayout.Parent = Row

                    local bw = (#btns == 1) and UDim2.new(1, 0, 1, 0) or UDim2.new(0.5, -3, 1, 0)
                    for _, bd in ipairs(btns) do
                        local Btn = Instance.new("TextButton")
                        Btn.Font = Enum.Font.GothamBold
                        Btn.Text = bd.Name or "Button"
                        Btn.TextColor3 = CACHE.Colors.White
                        Btn.TextSize = 11
                        Btn.TextTransparency = 0.2
                        Btn.BackgroundTransparency = 0.9
                        Btn.Size = bw
                        Btn.Parent = Row

                        local BtnCorner = Instance.new("UICorner")
                        BtnCorner.CornerRadius = UDim.new(0, 6)
                        BtnCorner.Parent = Btn

                        if bd.Callback then
                            allConnections[#allConnections + 1] = Btn.MouseButton1Click:Connect(bd.Callback)
                        end
                    end
                end

                RegisterSearch({ label = CardConfig.Title, tab = TabConfig.Name, kind = "Card", switch = SearchSwitch })
                CountItem = CountItem + 1
                return Card
            end

            function Items:AddDivider()
                local Divider = Instance.new("Frame")
                Divider.Name = "Divider"
                Divider.Parent = SectionAdd
                Divider.AnchorPoint = Vector2.new(0.5, 0)
                Divider.Position = UDim2.new(0.5, 0, 0, 0)
                Divider.Size = UDim2.new(1, 0, 0, 2)
                Divider.BackgroundTransparency = 1
                Divider.LayoutOrder = CountItem

                local DividerGradient = Instance.new("UIGradient")
                DividerGradient.Color = ColorSequence.new {
                    ColorSequenceKeypoint.new(0, CACHE.Colors.Gray20),
                    ColorSequenceKeypoint.new(0.5, ConfigColor),
                    ColorSequenceKeypoint.new(1, CACHE.Colors.Gray20)
                }
                DividerGradient.Parent = Divider

                local DividerCorner = Instance.new("UICorner")
                DividerCorner.CornerRadius = UDim.new(0, 2)
                DividerCorner.Parent = Divider

                CountItem = CountItem + 1
                return Divider
            end

            function Items:AddSubSection(title)
                title = title or "Sub Section"

                local SubSection = Instance.new("Frame")
                SubSection.Name = "SubSection"
                SubSection.Parent = SectionAdd
                SubSection.BackgroundTransparency = 1
                SubSection.Size = UDim2.new(1, 0, 0, 22)
                SubSection.LayoutOrder = CountItem

                local Background = Instance.new("Frame")
                Background.Parent = SubSection
                Background.Size = UDim2.new(1, 0, 1, 0)
                Background.BackgroundTransparency = 0.935

                local bgCorner = Instance.new("UICorner")
                bgCorner.CornerRadius = UDim.new(0, 6)
                bgCorner.Parent = Background

                local Label = Instance.new("TextLabel")
                Label.Parent = SubSection
                Label.AnchorPoint = Vector2.new(0, 0.5)
                Label.Position = UDim2.new(0, 10, 0.5, 0)
                Label.Size = UDim2.new(1, -20, 1, 0)
                Label.BackgroundTransparency = 1
                Label.Font = Enum.Font.GothamBold
                Label.Text = "──> " .. title .. " <──"
                Label.TextColor3 = CACHE.Colors.Gray230
                Label.TextSize = 12
                Label.TextXAlignment = Enum.TextXAlignment.Left

                CountItem = CountItem + 1
                return SubSection
            end

            CountSection = CountSection + 1
            return Items
        end

        CountTab = CountTab + 1
        local safeName = TabConfig.Name:gsub("%s+", "_")
        if not _G[safeName] then
            _G[safeName] = Sections
        end
        return Sections
    end

    function Tabs:InfoTab(InfoConfig)
        InfoConfig = InfoConfig or {}
        local Sections = Tabs:AddTab({
            Name = InfoConfig.Name or "Info",
            Icon = InfoConfig.Icon or "idea",
        })
        local Items = Sections:AddSection(InfoConfig.SectionTitle or "Information", true)

        if InfoConfig.Banner and InfoConfig.Banner ~= "" then
            Items:AddBanner({
                Image = InfoConfig.Banner,
                Version = InfoConfig.Version,
                AspectRatio = InfoConfig.BannerAspectRatio,
            })
        end

        if InfoConfig.DiscordLink then
            Items:AddCard({
                Title = InfoConfig.DiscordName or "Community",
                Description = InfoConfig.DiscordText or "Support, updates and announcements.",
                Logo = Icons.discord,
                Buttons = {
                    {
                        Name = "Copy Invite",
                        Callback = function()
                            if setclipboard then
                                setclipboard(InfoConfig.DiscordLink)
                                than("Discord invite copied", 4, ConfigColor, "WisHub", "Community")
                            end
                        end,
                    },
                },
            })
        end

        for _, card in ipairs(InfoConfig.Cards or {}) do
            Items:AddCard(card)
        end

        return Sections, Items
    end

    GuiFunc.InfoTab = function(_, cfg) return Tabs:InfoTab(cfg) end
    Tabs.Window = GuiFunc
    Tabs.ExportConfig = function() return GuiFunc:ExportConfig() end
    Tabs.ImportConfig = function(_, str) return GuiFunc:ImportConfig(str) end

    if GuiConfig.Search then
        allConnections[#allConnections + 1] = UserInputService.InputBegan:Connect(function(input, gpe)
            if gpe then return end
            local ctrl = UserInputService:IsKeyDown(Enum.KeyCode.LeftControl)
                or UserInputService:IsKeyDown(Enum.KeyCode.RightControl)
                or UserInputService:IsKeyDown(Enum.KeyCode.LeftMeta)
                or UserInputService:IsKeyDown(Enum.KeyCode.RightMeta)
            local shift = UserInputService:IsKeyDown(Enum.KeyCode.LeftShift)
                or UserInputService:IsKeyDown(Enum.KeyCode.RightShift)
            if ctrl and shift and input.KeyCode == Enum.KeyCode.F then
                if DropShadowHolder then DropShadowHolder.Visible = true end
                if GuiFunc.FocusSearch then GuiFunc.FocusSearch() end
            elseif ctrl and input.KeyCode == Enum.KeyCode.O then
                if DropShadowHolder then DropShadowHolder.Visible = true end
                if GuiFunc.FocusSearch then GuiFunc.FocusSearch() end
            end
        end)
    end

    task.spawn(function()
        task.wait(0.5)
        local autoName = GuiFunc:GetAutoLoad()
        if autoName and autoName ~= "" then
            GuiFunc:LoadConfigByName(autoName)
        end
    end)

    return Tabs
end

return Chloex
